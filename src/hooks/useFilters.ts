import { useState, useEffect } from "react"
import { paths } from "../services/path.service"

interface RadioMetadata {
	tags: FilterOption[]
	countries: FilterOption[]
	languages: FilterOption[]
	isLoading: boolean
	error: Error | null
}

function distinctFilterOption(options: FilterOption[]) {
	const optionSet = new Set<string>()

	return options.filter((option: FilterOption) => {
		if (optionSet.has(option.name)) return false
		optionSet.add(option.name)
		return true
	})
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
				console.info("fetching filters...")
				setIsLoading(true)

				// Make all API requests in parallel
				const [countriesResponse, languagesResponse, tagsResponse] = await Promise.all([
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

				const tags: FilterOption[] = tagsData
					.map((tag: { name: string; stationcount: number }) => ({
						name: tag.name,
						stationCount: tag.stationcount
					}))
					.filter((tag) => tag.stationcount > 20)

				setTags(distinctFilterOption(tags))

				const countries = countriesData.map((country: { name: string; stationcount: number }) => ({
					name: country.name,
					stationCount: country.stationcount
				}))
				setCountries(distinctFilterOption(countries))

				const languages = languagesData.map((language: { name: string; stationcount: number }) => ({
					name: language.name,
					stationCount: language.stationcount
				}))
				setLanguages(distinctFilterOption(languages))
			} catch (err) {
				setError(err instanceof Error ? err : new Error("An unknown error occurred"))
				console.error(`Error fetching radio metadata: ${JSON.stringify(err)}`)
			} finally {
				setIsLoading(false)
			}
		}

		fetchMetadata()
	}, [])

	return { tags, countries, languages, isLoading, error }
}
