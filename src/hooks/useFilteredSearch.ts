import { useState, useEffect, useCallback } from "react"

type Filter = {
	country?: string
	tag?: string
	language?: string
	offset?: string
	limit?: string
	reverse?: boolean
}

const buildFilterRequest = (filter: Filter): URLSearchParams => {
	const searchParams = new URLSearchParams()

	for (const key in filter) {
		const value = filter[key]
		if (filter[key]) searchParams.set(key, filter[key])
	}
	if (filter.tag) searchParams

	return searchParams
}

export const useFilteredSearch = () => {
	const [currentFilter, setCurrentFilter] = useState<Filter>()
	const [stations, setStations] = useState<RadioStation[]>([])

	const resetFilter = useCallback((filter?: Filter) => {
		setCurrentFilter(filter ?? {})
	}, [])

	const updateFilter = useCallback((filter: Filter) => {
		setCurrentFilter({ currentFilter, ...filter })
	}, [])
}
