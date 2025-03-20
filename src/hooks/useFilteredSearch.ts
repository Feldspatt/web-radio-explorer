import { useState, useEffect, useCallback } from "react"
import { paths } from "../services/path.service"

type Filter = {
	country?: string
	tag?: string
	language?: string
	offset?: string
	limit?: string
	reverse?: string
	order?: "clickcount" | "vote" | "name"
}

const buildFilterRequest = (filter: Filter): URLSearchParams => {
	const searchParams = new URLSearchParams()

	for (const [key, value] of Object.entries(filter)) {
		searchParams.set(key, value)
	}

	searchParams.set("hidebroken", "true")

	if ((filter.reverse === "true" && filter.order === "clickcount") || filter.order === "vote") {
		searchParams.set("reverse", "false")
	}

	return searchParams
}

export const useFilteredSearch = () => {
	const [currentFilter, setCurrentFilter] = useState<Filter>({})
	const [stations, setStations] = useState<RadioStation[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	useEffect(() => {
		const fetchSearch = async () => {
			setIsLoading(true)
			try {
				const searchParams = buildFilterRequest(currentFilter)
				const response = await fetch(paths.getStationSearch(searchParams))

				if (response.ok) {
					setStations(await response.json())
				}
			} catch (error) {
				console.error(`Fetching station by search filter failed: ${error}`)
			} finally {
				setIsLoading(false)
			}
		}

		fetchSearch()
	}, [currentFilter])

	const resetFilter = useCallback((filter?: Filter) => {
		setCurrentFilter(filter ?? {})
	}, [])

	const updateFilter = (filter: Filter) => {
		setCurrentFilter({ ...currentFilter, ...filter })
	}

	return { stations, updateFilter, resetFilter, isLoading }
}
