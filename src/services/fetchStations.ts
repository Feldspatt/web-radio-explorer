import { getFavoritesList, getLastListenedList } from "../services/storage"
import { paths } from "./path.service"

export async function fetchStations({ source, filter }: StationSelector): Promise<RadioStation[]> {
	try {
		let newStations = []

		switch (source) {
			case "favorite": {
				const favorites = getFavoritesList()
				const unsortedStations = await fetchStationsByUUIDs(favorites)
				newStations = sortByOrderOfAppearance(unsortedStations, favorites)
				break
			}
			case "recent": {
				const recent = getLastListenedList()
				const unsortedStations = await fetchStationsByUUIDs(recent)
				newStations = sortByOrderOfAppearance(unsortedStations, recent)
				break
			}
			case "search": {
				newStations = await fetchStationsByFilter(filter ?? { order: "votes" })
				break
			}
		}

		return newStations
	} catch (error) {
		console.error(`Error fetchings stations: ${error}`)
		throw error
	}
}

function sortByOrderOfAppearance(stations: RadioStation[], appearance: string[]) {
	return appearance.map((uuid) => {
		const station = stations.find((station) => station.stationuuid === uuid)
		if (!station) throw new Error(`Error retrieving station ${uuid}`)
		return station
	})
}

const buildFilterRequest = (filter: Partial<Filter>): URLSearchParams => {
	const searchParams = new URLSearchParams()
	for (const [key, value] of Object.entries(filter)) {
		if (value !== undefined) searchParams.set(key, value)
	}

	searchParams.set("reverse", setReverse(filter.order, filter.reverse))

	searchParams.set("limit", "20")
	searchParams.set("hidebroken", "true")

	return searchParams
}

function setReverse(order: Order | undefined, value: "true" | "false" | undefined) {
	if (order === "name") return value ?? "false"
	return value === "true" ? "false" : "true"
}

async function fetchStationsByFilter(filter: Partial<Filter>): Promise<RadioStation[]> {
	try {
		const searchParams = buildFilterRequest(filter)
		const response = await fetch(paths.getStationSearch(searchParams))

		if (response.ok) {
			return await response.json()
		}

		return []
	} catch (error) {
		console.error(`Fetching station by search filter failed: ${error}`)
		throw error
	}
}

async function fetchStationsByUUIDs(uuids: string[]): Promise<RadioStation[]> {
	if (uuids.length === 0) {
		console.info("uuids list is empty, skipping fetch and returning empty array...")
		return []
	}

	const response = await fetch(paths.getByUUID(uuids))

	if (!response.ok) {
		throw new Error(`Error fetching stations by uuid: ${response.json()}`)
	}

	return response.json()
}
