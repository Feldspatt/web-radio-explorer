import { useState, useEffect } from "react";
import { paths, serversAddresses } from "../services/path.service.ts";

interface RadioBrowserServerSelectorProps {
	onServerSelected: (server: Server) => void;
}

type Stats = {
	stations: number;
	stations_broken: number;
	status: "OK" | string;
};

interface Server {
	name: string;
	stations: number;
}

const RadioBrowserServerSelector = ({
	onServerSelected,
}: RadioBrowserServerSelectorProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [allServersFailed, setAllServersFailed] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [timer] = useState(
		new Promise((resolve) => setTimeout(resolve, 1000)),
	);

	useEffect(() => {
		fetchAndSelectServer().then();
	});

	const fetchAndSelectServer = async () => {
		setIsLoading(true);
		setErrorMessage(null);
		setAllServersFailed(false);

		try {
			const server = await Promise.any(
				serversAddresses.map(async (server) =>
					testServer(server),
				),
			);
			await timer;
			if (server) {
				setIsLoading(false);
				console.log(
					`${server.name} is operational with ${server.stations} stations`,
				);

				onServerSelected(server);
				return;
			} else console.warn(`no server operational.`);
		} catch (error) {
			console.error(
				`an error occured while looking for a valid server: ${JSON.stringify(error)}`,
			);
		}

		console.error("no operational server found!");
		setAllServersFailed(true);
		setIsLoading(false);
	};

	const testServer = async (serverUrl: string): Promise<Server | null> => {
		try {
			const response = await fetch(paths.getServerStats(serverUrl));

			if (!response.ok) {
				throw new Error(
					`Failed to fetch server stats: ${response.status}`,
				);
			}

			const stats: Stats = await response.json();

			if (stats.status !== "OK") {
				throw new Error(`Server is not ok: ${stats.status}`);
			}

			return {
				name: serverUrl,
				stations: stats.stations - stats.stations_broken,
			};
		} catch (err) {
			console.warn(`Error selecting server ${serverUrl}:`, err);
		}

		return null;
	};

	// Always show splash art except when all servers have failed
	if (allServersFailed) {
		return (
			<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
				Error: {errorMessage || "All servers failed to respond"}
				<button
					className="ml-4 px-2 py-1 bg-red-200 hover:bg-red-300 rounded"
					onClick={fetchAndSelectServer}
				>
					Retry
				</button>
			</div>
		);
	}

	// Show splash art in all other cases (loading, success)
	return (
		<div className="relative">
			<object
				type="image/svg+xml"
				data={`${import.meta.env.BASE_URL}splash_art.svg`}
				className="w-full"
			>
				Your browser does not support SVG
			</object>

			{isLoading && (
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-75 px-3 py-1 rounded">
					Connecting to radio servers...
				</div>
			)}

			{errorMessage && !allServersFailed && (
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-75 px-3 py-1 rounded text-yellow-700">
					Warning: {errorMessage}
				</div>
			)}
		</div>
	);
};

export default RadioBrowserServerSelector;
