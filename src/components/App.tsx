import "../style/default.css"
import "../style/index.css"
import "../style/App.css"
import "../style/scrollbar.css"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import RadioPlayer from "./RadioPlayer.tsx"
import StationSelector from "./StationSelector.tsx"
import ServerPicker from "./ServerPicker.tsx"
import { paths } from "../services/path.service.ts"
import StationList from "./StationList.tsx"
import { addLastListened } from "../services/storage.ts"

const App: React.FC = () => {
	const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null)
	const [autoPlay, setAutoPlay] = useState<boolean>(false)
	const [selectedServer, setSelectedServer] = useState<Server | null>(null)

	const [stationSelector, setStationSelector] = useState<StationSelector>({ source: "search" })

	// Load saved station and server from localStorage on component mount
	useEffect(() => {
		try {
			// Try to load saved server first
			const savedServerJSON = localStorage.getItem("lastServer")
			if (savedServerJSON) {
				const savedServer = JSON.parse(savedServerJSON) as Server
				paths.setServer(savedServer.name)
				setSelectedServer(savedServer)
			}

			// Then try to load saved station, but don't autoplay
			const savedStationJSON = localStorage.getItem("lastStation")
			if (savedStationJSON) {
				const savedStation = JSON.parse(savedStationJSON) as RadioStation
				setSelectedStation(savedStation)
				// Don't autoplay when loading from localStorage
				setAutoPlay(false)
			}
		} catch (error) {
			console.error("Error loading data from localStorage:", error)
		}
	}, [])

	const onNewServerSelected = (server: Server) => {
		paths.setServer(server.name)
		setSelectedServer(server)

		// Save selected server to localStorage
		try {
			localStorage.setItem("lastServer", JSON.stringify(server))
		} catch (error) {
			console.error("Error saving server to localStorage:", error)
		}
	}

	// Handle station selection and save to localStorage
	const handleStationSelect = (station: RadioStation) => {
		setSelectedStation(station)
		setAutoPlay(true)
		try {
			addLastListened(station.stationuuid)
		} catch (error) {
			console.error("Error saving station to localStorage:", error)
		}
	}

	const handleStationList = useCallback((stationSelector: StationSelector) => {
		setStationSelector(stationSelector)
	}, [])

	return (
		<>
			{!selectedServer ? (
				<ServerPicker onServerSelected={(server) => onNewServerSelected(server)} />
			) : (
				<>
					<div className='radio-app'>
						<StationSelector stationsPerPage={24} onStationsUpdate={handleStationList} />
						<StationList
							source={stationSelector.source}
							filter={stationSelector.filter}
							onStationSelect={handleStationSelect}
						/>
						<RadioPlayer station={selectedStation} autoPlay={autoPlay} />
					</div>
				</>
			)}
			{/*</ThemeProvider>*/}
		</>
	)
}

export default App
