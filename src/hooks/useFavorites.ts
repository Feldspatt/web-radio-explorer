import { useState, useEffect, useCallback } from "react"
import { useStationFetch } from "./useStationFetch"

interface UseFavoritesResult {
	favorites: RadioStation[]
	isLoading: boolean
	error: Error | null
	toggleFavorite: (stationUuid: string, station?: RadioStation) => void
	isFavorite: (stationUuid: string) => boolean
	addFavorite: (station: RadioStation) => void
	removeFavorite: (stationUuid: string) => void
	clearFavorites: () => void
}

export const useFavorites = (): UseFavoritesResult => {
	const [favorites, setFavorites] = useState<RadioStation[]>([])
	const [favoriteUuids, setFavoriteUuids] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<Error | null>(null)
	const { fetchStationsByUUID } = useStationFetch()

	// Load favorite UUIDs from localStorage
	const loadFavoriteUuids = useCallback(() => {
		try {
			const storedFavorites = localStorage.getItem("favorites")
			const uuids = storedFavorites ? JSON.parse(storedFavorites) : []
			setFavoriteUuids(uuids)
			return uuids
		} catch (err) {
			console.error("Error loading favorite UUIDs:", err)
			return []
		}
	}, [])

	// Load full station details for favorites
	const loadFavoriteStations = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			const uuids = loadFavoriteUuids()

			if (uuids.length === 0) {
				setFavorites([])
				return
			}

			const stations = await fetchStationsByUUID(uuids)

			// Preserve the original order from localStorage
			const orderedStations: RadioStation[] = []
			for (const uuid of uuids) {
				const station = stations.find((s) => s.stationuuid === uuid)
				if (station) orderedStations.push(station)
			}

			setFavorites(orderedStations)
		} catch (err) {
			const errorMessage = err instanceof Error ? err : new Error("An unknown error occurred")
			setError(errorMessage)
			console.error("Error loading favorite stations:", err)
		} finally {
			setIsLoading(false)
		}
	}, [fetchStationsByUUID, loadFavoriteUuids])

	// Check if a station is a favorite
	const isFavorite = useCallback(
		(stationUuid: string): boolean => {
			return favoriteUuids.includes(stationUuid)
		},
		[favoriteUuids]
	)

	// Add a station to favorites
	const addFavorite = useCallback(
		(station: RadioStation) => {
			try {
				const updatedUuids = [...favoriteUuids]

				// Only add if not already in favorites
				if (!updatedUuids.includes(station.stationuuid)) {
					updatedUuids.push(station.stationuuid)
					localStorage.setItem("favorites", JSON.stringify(updatedUuids))
					setFavoriteUuids(updatedUuids)

					// Update the favorites list with the new station
					setFavorites((prev) => [...prev, station])
				}
			} catch (err) {
				console.error("Error adding favorite:", err)
			}
		},
		[favoriteUuids]
	)

	// Remove a station from favorites
	const removeFavorite = useCallback(
		(stationUuid: string) => {
			try {
				const updatedUuids = favoriteUuids.filter((uuid) => uuid !== stationUuid)
				localStorage.setItem("favorites", JSON.stringify(updatedUuids))
				setFavoriteUuids(updatedUuids)

				// Update the favorites list by removing the station
				setFavorites((prev) => prev.filter((station) => station.stationuuid !== stationUuid))
			} catch (err) {
				console.error("Error removing favorite:", err)
			}
		},
		[favoriteUuids]
	)

	// Toggle a station's favorite status
	const toggleFavorite = useCallback(
		(stationUuid: string, station?: RadioStation) => {
			if (isFavorite(stationUuid)) {
				removeFavorite(stationUuid)
			} else if (station) {
				addFavorite(station)
			} else {
				// If we only have the UUID but not the station object,
				// find it in our current favorites list if possible
				const existingStation = favorites.find((s) => s.stationuuid === stationUuid)
				if (existingStation) {
					addFavorite(existingStation)
				} else {
					console.warn("Attempted to add favorite without station data")
				}
			}
		},
		[isFavorite, removeFavorite, addFavorite, favorites]
	)

	// Clear all favorites
	const clearFavorites = useCallback(() => {
		localStorage.removeItem("favorites")
		setFavoriteUuids([])
		setFavorites([])
	}, [])

	// Load favorites on mount
	useEffect(() => {
		loadFavoriteStations()
	}, [loadFavoriteStations])

	return {
		favorites,
		isLoading,
		error,
		toggleFavorite,
		isFavorite,
		addFavorite,
		removeFavorite,
		clearFavorites
	}
}
