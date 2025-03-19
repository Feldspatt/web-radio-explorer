import { useState, useEffect } from "react"
import { paths } from "../services/path.service"

interface RadioMetadata {
	tags: FilterOption[]
	countries: FilterOption[]
	languages: FilterOption[]
	isLoading: boolean
	error: Error | null
}

export const useFilters = (): RadioMetadata => {
	const [tags, setTags] = useState<FilterOption[]>([])
	const [countries, setCountries] = useState<FilterOption[]>([])
	const [languages, setLanguages] = useState<FilterOption[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const fetchMetadata = async () => {
			try {
				setIsLoading(true)

				// Make all API requests in parallel
				const [tagsResponse, countriesResponse, languagesResponse] = await Promise.all([
					fetch(paths.getCountries()),
					fetch(paths.getTags()),
					fetch(paths.getLanguages())
				])

				// Check if any of the responses failed
				if (!tagsResponse.ok) throw new Error("Failed to fetch tags")
				if (!countriesResponse.ok) throw new Error("Failed to fetch countries")
				if (!languagesResponse.ok) throw new Error("Failed to fetch languages")

				// Parse all responses in parallel
				const [tagsData, countriesData, languagesData] = await Promise.all([
					tagsResponse.json(),
					countriesResponse.json(),
					languagesResponse.json()
				])

				setTags(
					tagsData.map((tag: { name: string; stationcount: number }) => ({
						name: tag.name,
						stationcount: tag.stationcount
					}))
				)

				setCountries(
					countriesData.map((country: { name: string; stationcount: number }) => ({
						name: country.name,
						stationcount: country.stationcount
					}))
				)

				setLanguages(
					languagesData.map((language: { name: string; stationcount: number }) => ({
						name: language.name,
						stationcount: language.stationcount
					}))
				)
			} catch (err) {
				setError(err instanceof Error ? err : new Error("An unknown error occurred"))
				console.error("Error fetching radio metadata:", err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchMetadata()
	}, [])

	return { tags, countries, languages, isLoading, error }
}
