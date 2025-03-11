import { useState, useEffect } from 'react';
import { defaultServerUrl, paths } from "../../services/path.service.ts";
import './ServerPicker.css';

interface RadioBrowserServerSelectorProps {
    onServerSelected?: (server: Server) => void;
}

interface Server {
    name: string;
    stations: number;
}

const RadioBrowserServerSelector = ({ onServerSelected }: RadioBrowserServerSelectorProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [allServersFailed, setAllServersFailed] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [checkedServers, setCheckedServers] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAndSelectServer().then();
    }, []);

    const fetchAndSelectServer = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setAllServersFailed(false);

        try {
            // Perform DNS lookup for all.api.radio-browser.info
            const servers = await performDnsLookup();

            if (servers.length === 0) {
                throw new Error("No servers available from DNS lookup");
            }

            // Filter for HTTPS servers only
            const httpsServers = servers.filter(server => server.startsWith("https://"));

            if (httpsServers.length === 0) {
                throw new Error("No HTTPS servers available");
            }

            // Try to select a random server
            await selectRandomServer(httpsServers);
        } catch (err) {
            console.error('Error in server selection process:', err);
            if (err instanceof Error) setErrorMessage(err.message);

            // Try default server as last resort
            try {
                await selectServer(defaultServerUrl);
            } catch (defaultErr) {
                console.error('Default server failed:', defaultErr);
                setAllServersFailed(true);
                setIsLoading(false);
            }
        }
    };

    const performDnsLookup = async (): Promise<string[]> => {
        try {
            // Using a fetch to a dedicated endpoint that would perform the DNS lookup on the server side
            // This is a mock implementation - in a real app, you'd need a backend service for this
            const response = await fetch('/api/dns-lookup/all.api.radio-browser.info');

            if (!response.ok) {
                throw new Error(`DNS lookup failed: ${response.status}`);
            }

            const data = await response.json();
            return data.servers || [];
        } catch (err) {
            console.error('DNS lookup error:', err);
            throw err;
        }
    };

    const selectRandomServer = async (serverList: string[]) => {
        // Filter out servers we've already checked and failed
        const availableServers = serverList.filter(server => !checkedServers.has(server));

        if (availableServers.length === 0) {
            setAllServersFailed(true);
            setErrorMessage("All servers unavailable. Please try again later.");
            setIsLoading(false);
            return;
        }

        // Select a random server from available ones
        const randomIndex = Math.floor(Math.random() * availableServers.length);
        const randomServer = availableServers[randomIndex];

        console.debug('Randomly selected server:', randomServer);

        // Test if the server is operational
        try {
            await selectServer(randomServer);
        } catch (err) {
            // Mark this server as checked/failed
            const newCheckedServers = new Set(checkedServers);
            newCheckedServers.add(randomServer);
            setCheckedServers(newCheckedServers);

            // Try another server
            console.error(`Server ${randomServer} failed:`, err);
            await selectRandomServer(serverList);
        }
    };

    const selectServer = async (serverUrl: string) => {
        try {
            const response = await fetch(paths.getServerStats(serverUrl));

            if (!response.ok) {
                throw new Error(`Failed to fetch server stats: ${response.status}`);
            }

            const stats = await response.json();

            if (stats.status !== 'OK') {
                throw new Error(`Server is not ok: ${stats.status}`);
            }

            // Call the callback with the selected server
            if (onServerSelected) {
                await new Promise(resolve => { setTimeout(resolve, 1000) });
                onServerSelected({
                    name: serverUrl,
                    stations: stats.stations - stats.stations_broken
                });
            }

            setIsLoading(false);
            console.log(`${serverUrl} is operational with ${stats.stations - stats.stations_broken} stations`);
        } catch (err) {
            console.error(`Error selecting server ${serverUrl}:`, err);
            throw err;
        }
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