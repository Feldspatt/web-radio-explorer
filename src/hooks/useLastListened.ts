import { useState, useEffect, useCallback } from "react"
import { useStationFetch } from "./useStationFetch"

interface UseLastListenedResult {
	recentlyListened: RadioStation[]
	isLoading: boolean
	error: Error | null
	addToRecentlyListened: (station: RadioStation) => void
}

export const useLastListened = (stationsLimit = 20): UseLastListenedResult => {
	const [recentlyListened, setRecentlyListened] = useState<RadioStation[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<Error | null>(null)
	const { fetchStationsByUUID } = useStationFetch()

	const loadRecentlyListenedStations = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Get recently listened UUIDs from localStorage
			const recentUUIDs: string[] = JSON.parse(localStorage.getItem("last_listened") || "[]")

			// Limit to stationsLimit
			const limitedUUIDs = recentUUIDs.slice(0, stationsLimit)

			if (limitedUUIDs.length > 0) {
				// Fetch station details for each UUID
				const recentStations = await fetchStationsByUUID(limitedUUIDs)

				// Preserve original order from localStorage
				const orderedStations: RadioStation[] = []
				for (const uuid of limitedUUIDs) {
					const station = recentStations.find((station) => station.stationuuid === uuid)
					if (station) orderedStations.push(station)
				}

				setRecentlyListened(orderedStations)
			} else {
				setRecentlyListened([])
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err : new Error("An unknown error occurred")
			setError(errorMessage)
			console.error("Error loading recently listened stations:", err)
			setRecentlyListened([])
		} finally {
			setIsLoading(false)
		}
	}, [fetchStationsByUUID, stationsLimit])

	// Add a station to recently listened
	const addToRecentlyListened = useCallback(
		(station: RadioStation) => {
			try {
				// Get current list
				let recentUUIDs: string[] = JSON.parse(localStorage.getItem("last_listened") || "[]")

				// Remove the station if it's already in the list
				recentUUIDs = recentUUIDs.filter((uuid) => uuid !== station.stationuuid)

				// Add the station to the beginning of the list
				recentUUIDs.unshift(station.stationuuid)

				// Limit the list size
				if (recentUUIDs.length > stationsLimit) {
					recentUUIDs = recentUUIDs.slice(0, stationsLimit)
				}

				// Save back to localStorage
				localStorage.setItem("last_listened", JSON.stringify(recentUUIDs))

				// Update state (place the new station at the beginning)
				setRecentlyListened((prev) => {
					const updatedList = prev.filter((s) => s.stationuuid !== station.stationuuid)
					return [station, ...updatedList].slice(0, stationsLimit)
				})
			} catch (err) {
				console.error("Error updating recently listened:", err)
			}
		},
		[stationsLimit]
	)

	// Load recently listened stations on mount
	useEffect(() => {
		loadRecentlyListenedStations()
	}, [loadRecentlyListenedStations])

	return {
		recentlyListened,
		isLoading,
		error,
		addToRecentlyListened
	}
}
