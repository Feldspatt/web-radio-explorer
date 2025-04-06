import "../style/index.css"
import "../style/themes.css"
import "../style/App.css"
import "../style/scrollbar.css"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import RadioPlayer from "./RadioPlayer.tsx"
import StationSelector from "./StationSelector.tsx"
import ServerPicker from "./ServerPicker.tsx"
import StationList from "./StationList.tsx"
import { addLastListened, getLastListenedList, getLastStationSource } from "../services/storage.ts"
import { fetchStationsByUUIDs } from "../services/fetchStations.ts"
import ThemeToggle from "./ThemeToggle.tsx"

const App: React.FC = () => {
	const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null)
	const [autoPlay, setAutoPlay] = useState<boolean>(false)
	const [isServerLoaded, setIsServerLoaded] = useState<boolean>(false)

	const [source, setSource] = useState<StationSource>(getLastStationSource ?? "search")
	const [filter, setFilter] = useState<Partial<Filter>>({})

	useEffect(() => {
		if (!isServerLoaded) return
		const selectLastListenedStation = async () => {
			const lastListenedList = getLastListenedList()
			if (lastListenedList.length === 0) return

			const station = (await fetchStationsByUUIDs([lastListenedList[0]]))[0]
			setSelectedStation(station)
		}

		selectLastListenedStation()
	}, [isServerLoaded])

	const handleStationSelect = (station: RadioStation) => {
		setSelectedStation(station)
		setAutoPlay(true)
		try {
			addLastListened(station.stationuuid)
		} catch (error) {
			console.error("Error saving station to localStorage:", error)
		}
	}

	const handleFilterUpdate = useCallback((filter: Partial<Filter>, merge: boolean) => {
		if (merge)
			setFilter((prevFilter) => ({
				...prevFilter,
				...filter
			}))
		else setFilter(filter)
	}, [])

	return (
		<>
			{!isServerLoaded ? (
				<ServerPicker onServerLoaded={() => setIsServerLoaded(true)} />
			) : (
				<>
					<ThemeToggle />
					<div className='radio-app'>
						<StationSelector
							stationsPerPage={24}
							filter={filter}
							setFilter={handleFilterUpdate}
							source={source}
							setSource={setSource}
						/>
						<StationList source={source} filter={filter} onStationSelect={handleStationSelect} />
						<RadioPlayer station={selectedStation} autoPlay={autoPlay} />
					</div>
				</>
			)}
		</>
	)
}

export default App
