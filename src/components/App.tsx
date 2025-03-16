import "../style/default.css";
import "../style/index.css";
import "../style/App.css";
import "../style/scrollbar.css";

import type React from "react";
import { useState, useEffect } from "react";
import RadioPlayer from "./RadioPlayer.tsx";
import StationSelector from "./StationSelector.tsx";
import ServerPicker from "./ServerPicker.tsx";
import { paths } from "../services/path.service.ts";
import StationList from "./StationList.tsx";
import { FavoritesProvider } from "./FavoritesProvider.tsx";
// import { ThemeProvider } from "./ThemeProvider.tsx";

const App: React.FC = () => {
	const [selectedStation, setSelectedStation] =
		useState<RadioStation | null>(null);
	const [autoPlay, setAutoPlay] = useState<boolean>(false);
	const [stations, setStations] = useState<RadioStation[]>([]);
	const [selectedServer, setSelectedServer] = useState<Server | null>(null);

	// Load saved station and server from localStorage on component mount
	useEffect(() => {
		try {
			// Try to load saved server first
			const savedServerJSON = localStorage.getItem("lastServer");
			if (savedServerJSON) {
				const savedServer = JSON.parse(
					savedServerJSON,
				) as Server;
				paths.setServer(savedServer.name);
				setSelectedServer(savedServer);
			}

			// Then try to load saved station, but don't autoplay
			const savedStationJSON = localStorage.getItem("lastStation");
			if (savedStationJSON) {
				const savedStation = JSON.parse(
					savedStationJSON,
				) as RadioStation;
				setSelectedStation(savedStation);
				// Don't autoplay when loading from localStorage
				setAutoPlay(false);
			}
		} catch (error) {
			console.error("Error loading data from localStorage:", error);
		}
	}, []);

	const onNewServerSelected = (server: Server) => {
		paths.setServer(server.name);
		setSelectedServer(server);

		// Save selected server to localStorage
		try {
			localStorage.setItem("lastServer", JSON.stringify(server));
		} catch (error) {
			console.error("Error saving server to localStorage:", error);
		}
	};

	// Handle station selection and save to localStorage
	const handleStationSelect = (station: RadioStation) => {
		setSelectedStation(station);
		setAutoPlay(true);
		// Save selected station to localStorage
		try {
			localStorage.setItem("lastStation", JSON.stringify(station));
		} catch (error) {
			console.error("Error saving station to localStorage:", error);
		}
	};

	return (
		<>
			<FavoritesProvider>
				{/*<ThemeProvider initialTheme={'nordic'} transitionDuration={100}>*/}
				{!selectedServer ? (
					<ServerPicker
						onServerSelected={(server) =>
							onNewServerSelected(server)
						}
					/>
				) : (
					<>
						<div className="radio-app">
							{/*<ThemeToggle />*/}
							{/*<header className="app-header">*/}
							{/*    <h1>Web Radio Explorer</h1>*/}
							{/*    <p>Discover and listen to radio stations from around the world</p>*/}
							{/*</header>*/}
							<StationSelector
								stationsPerPage={24}
								stationCount={
									selectedServer.stations
								}
								onStationsUpdate={(stations) =>
									setStations(stations)
								}
							/>
							<StationList
								stations={stations}
								onStationSelect={
									handleStationSelect
								}
							/>
							<RadioPlayer
								station={selectedStation}
								autoPlay={autoPlay}
							/>
						</div>
					</>
				)}
				{/*</ThemeProvider>*/}
			</FavoritesProvider>
		</>
	);
};

export default App;
