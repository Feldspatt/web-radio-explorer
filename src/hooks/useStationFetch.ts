import { useState, useCallback } from "react"

interface UseStationFetchResult {
	fetchStationsByUUID: (uuids: string[]) => Promise<RadioStation[]>
	fetchStationByUUID: (uuid: string) => Promise<RadioStation | null>
	isLoading: boolean
	error: Error | null
}

export const useStationFetch = (): UseStationFetchResult => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<Error | null>(null)

	const fetchStationsByUUID = useCallback(async (uuids: string[]): Promise<RadioStation[]> => {
		if (!uuids.length) return []

		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch("https://de1.api.radio-browser.info/json/stations/byuuid", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(uuids)
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch stations: ${response.status} ${response.statusText}`)
			}

			return await response.json()
		} catch (err) {
			const errorMessage = err instanceof Error ? err : new Error("An unknown error occurred")
			setError(errorMessage)
			console.error("Error fetching stations by UUID:", err)
			return []
		} finally {
			setIsLoading(false)
		}
	}, [])

	const fetchStationByUUID = useCallback(
		async (uuid: string): Promise<RadioStation | null> => {
			const stations = await fetchStationsByUUID([uuid])
			return stations.length > 0 ? stations[0] : null
		},
		[fetchStationsByUUID]
	)

	return {
		fetchStationsByUUID,
		fetchStationByUUID,
		isLoading,
		error
	}
}
