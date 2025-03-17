import "../style/StationSelector.css"
import type React from "react"
import { useState, useEffect } from "react"
import { paths } from "../services/path.service.ts"
import { useDebounce } from "../hooks/useDebounce.ts"
import { useFavorites } from "../hooks/useFavorites.ts"

interface StationSelectorProps {
	stationCount: number
	stationsPerPage: number
	onStationsUpdate: (stations: RadioStation[]) => void
}

// Helper function to convert HTTP URLs to HTTPS
const convertHttpToHttps = (stations: RadioStation[]): RadioStation[] => {
	return stations.map((station) => {
		if (station.url?.startsWith("http:")) {
			return {
				...station,
				url: station.url.replace("http:", "https:")
			}
		}
		return station
	})
}

const StationSelector: React.FC<StationSelectorProps> = ({ stationCount, stationsPerPage, onStationsUpdate }) => {
	// Tab state
	const [activeTab, setActiveTab] = useState<"explore" | "favorites" | "recent">("explore")

	const [filteredStations, setFilteredStations] = useState<RadioStation[]>([])
	const [totalFilteredStations, setTotalFilteredStations] = useState(stationCount)

	const { favorites } = useFavorites()
	const [recentlyListened, setRecentlyListened] = useState<RadioStation[]>([])

	// Filter states with station counts
	const [countries, setCountries] = useState<FilterOption[]>([])
	const [languages, setLanguages] = useState<FilterOption[]>([])
	const [tags, setTags] = useState<FilterOption[]>([])

	// Active filter
	const [activeFilter, setActiveFilter] = useState<"country" | "language" | "tag" | "search" | "favorite" | null>(null)

	// Filter values
	const [selectedCountry, setSelectedCountry] = useState<string>("all")
	const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
	const [selectedTag, setSelectedTag] = useState<string>("all")

	// Sort options
	const [sortBy, setSortBy] = useState<"name" | "votes" | "clickcount">("votes")

	// Pagination
	const [currentPage, setCurrentPage] = useState(1)
	const [favoritesPage, setFavoritesPage] = useState(1)

	// Pagination input values (for debouncing)
	const [currentPageInput, setCurrentPageInput] = useState<string>("1")
	const [favoritesPageInput, setFavoritesPageInput] = useState<string>("1")

	// Search term
	const [searchTerm, setSearchTerm] = useState("")
	const [searchInput, setSearchInput] = useState("")

	const debouncedSearchTerm = useDebounce(searchInput, 500)
	const debouncedCurrentPageInput = useDebounce(currentPageInput, 500)
	const debouncedFavoritesPageInput = useDebounce(favoritesPageInput, 500)

	// Update actual values when debounced values change
	useEffect(() => {
		handleSearch(debouncedSearchTerm)
	}, [debouncedSearchTerm])

	useEffect(() => {
		const pageNumber = Number.parseInt(debouncedCurrentPageInput) || 1
		if (pageNumber >= 1) {
			setCurrentPage(pageNumber)
		}
	}, [debouncedCurrentPageInput])

	useEffect(() => {
		const pageNumber = Number.parseInt(debouncedFavoritesPageInput) || 1
		if (pageNumber >= 1 && pageNumber <= Math.ceil(favorites.length / stationsPerPage)) {
			setFavoritesPage(pageNumber)
		}
	}, [debouncedFavoritesPageInput, favorites.length, stationsPerPage])

	// Fetch station details by UUID
	const fetchStationsByUUIDs = async (uuids: string[]): Promise<RadioStation[]> => {
		if (!uuids || uuids.length === 0) return []

		try {
			const stationsPromises = await fetch(paths.getByUUID(uuids))
			if (!stationsPromises.ok) {
				throw new Error(`Failed to fetch stations with UUID: ${uuids}`)
			}

			const stations = await stationsPromises.json()
			// Convert HTTP URLs to HTTPS
			return convertHttpToHttps(stations)
		} catch (err) {
			console.error("Error fetching stations by UUIDs:", err)
			return []
		}
	}

	// Load recently listened stations from localStorage UUIDs
	const loadRecentlyListenedStations = async () => {
		try {
			// Get recently listened UUIDs from localStorage
			const recentUUIDs = JSON.parse(localStorage.getItem("last_listened") || "[]")

			// Limit to stationsPerPage
			const limitedUUIDs = recentUUIDs.slice(0, stationsPerPage)

			if (limitedUUIDs.length > 0) {
				// Fetch station details for each UUID
				const recentStations = await fetchStationsByUUIDs(limitedUUIDs)
				const orderedStations = []
				for (const uuid of limitedUUIDs) {
					const station = recentStations.find((station) => station.stationuuid === uuid)
					if (station) orderedStations.push(station)
				}

				setRecentlyListened(orderedStations)
			} else {
				setRecentlyListened([])
			}
		} catch (err) {
			console.error("Error loading recently listened stations:", err)
			setRecentlyListened([])
		}
	}

	// Handle tab change and reset pagination
	const handleTabChange = (tab: "explore" | "favorites" | "recent") => {
		setActiveTab(tab)

		setCurrentPage(1)
		setCurrentPageInput("1")

		// Reset pagination when changing tabs
		if (tab === "explore") {
		} else if (tab === "favorites") {
			setFavoritesPage(1)
			setFavoritesPageInput("1")
		} else if (tab === "recent") {
			loadRecentlyListenedStations().then()
		}
	}

	// Update parent component with stations based on active tab
	useEffect(() => {
		if (activeTab === "explore") {
			onStationsUpdate(filteredStations)
		} else if (activeTab === "favorites") {
			onStationsUpdate(favorites)
		} else if (activeTab === "recent") {
			onStationsUpdate(recentlyListened)
		}
	}, [filteredStations, favorites, recentlyListened, activeTab, favoritesPage, onStationsUpdate])

	// Fetch countries, languages, and tags on mount
	useEffect(() => {
		const fetchMetadata = async () => {
			try {
				const [countriesResponse, languagesResponse, tagsResponse] = await Promise.all([
					fetch(paths.getCountries()),
					fetch(paths.getLanguages()),
					fetch(paths.getTags())
				])

				// Fetch countries
				const countriesData = await countriesResponse.json()
				const countryOptions = countriesData
					.filter((item: any) => item.name && item.stationcount > 5)
					.map((item: any) => ({
						name: item.name,
						stationCount: item.stationcount
					}))
					.sort((a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name))
				setCountries([{ name: "all", stationCount: stationCount }, ...countryOptions])

				// Fetch languages
				const languagesData = await languagesResponse.json()
				const languageOptions = languagesData
					.filter((item: any) => item.name && item.stationcount > 5)
					.map((item: any) => ({
						name: item.name,
						stationCount: item.stationcount
					}))
					.sort((a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name))
				setLanguages([{ name: "all", stationCount: stationCount }, ...languageOptions])

				// Fetch tags
				const tagsData = await tagsResponse.json()
				const tagOptions = tagsData
					.filter((item: any) => item.name && item.stationcount > 10)
					.map((item: any) => ({
						name: item.name,
						stationCount: item.stationcount
					}))
					.sort((a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name))
				setTags([{ name: "all", stationCount: stationCount }, ...tagOptions])
			} catch (err) {
				console.error(`Failed to load filter options. Please try again later. ${err}`)
			}
		}

		fetchMetadata().then()
	}, [stationCount])

	// Fetch stations based on the active filter and pagination
	useEffect(() => {
		// Only fetch if we're on the explore tab
		if (activeTab !== "explore") return

		const fetchStations = async () => {
			// Calculate offset based on current page
			const offset = (currentPage - 1) * stationsPerPage

			// Add filters to URL
			const params = new URLSearchParams()

			// Apply the active filter
			if (activeFilter === "country" && selectedCountry !== "all") {
				params.append("country", selectedCountry)
			} else if (activeFilter === "language" && selectedLanguage !== "all") {
				params.append("language", selectedLanguage)
			} else if (activeFilter === "tag" && selectedTag !== "all") {
				params.append("tag", selectedTag)
			} else if (activeFilter === "search" && searchTerm) {
				params.append("name", searchTerm)
			}

			// Sort by popularity by default
			params.append("order", sortBy)

			// Set reverse parameter based on sort type
			// For name, we want alphabetical order (A-Z), so reverse should be false
			// For votes and clickcount, we want highest first, so reverse should be true
			const shouldReverse = sortBy !== "name"
			params.append("reverse", shouldReverse.toString())

			params.append("hidebroken", "true")
			params.append("offset", offset.toString())
			params.append("limit", stationsPerPage.toString())

			try {
				const response = await fetch(paths.getStationSearch(params))
				if (!response.ok) {
					throw new Error("Network response was not ok")
				}

				const data = await response.json()

				// Check if the API returns the total stations count
				if (data.totalStationCount) {
					setTotalFilteredStations(data.totalStationCount)
				}

				// Assuming the API now returns an object with stations and total
				// If the API returns an array directly, adjust accordingly
				const stationsData = Array.isArray(data) ? data : data.stations || data

				// Filter out stations with invalid URLs and convert HTTP to HTTPS
				const validStations = stationsData
					.filter(
						(station: RadioStation) =>
							station.url && station.url.trim() !== "" && (station.url.startsWith("http:") || station.url.startsWith("https:"))
					)
					.map((station: RadioStation) => {
						if (station.url?.startsWith("http:")) {
							return {
								...station,
								url: station.url.replace("http:", "https:")
							}
						}
						return station
					})

				setFilteredStations(validStations)
			} catch (err) {
				setFilteredStations([])
			}
		}

		fetchStations().then()
	}, [
		activeFilter,
		selectedCountry,
		selectedLanguage,
		selectedTag,
		sortBy,
		currentPage,
		stationsPerPage,
		searchTerm,
		activeTab
	])

	// Apply country filter
	const handleCountryChange = (value: string) => {
		// Reset other filters
		setSelectedLanguage("all")
		setSelectedTag("all")
		setSearchTerm("")
		setSearchInput("")

		setSelectedCountry(value)
		setActiveFilter(value === "all" ? null : "country")

		// Find the selected country's station count
		const selectedCountryOption = countries.find((country) => country.name === value)
		if (selectedCountryOption) {
			setTotalFilteredStations(selectedCountryOption.stationCount)
		}
	}

	// Apply language filter
	const handleLanguageChange = (value: string) => {
		// Reset other filters
		setSelectedCountry("all")
		setSelectedTag("all")
		setSearchTerm("")
		setSearchInput("")

		setSelectedLanguage(value)
		setActiveFilter(value === "all" ? null : "language")

		// Find the selected language's station count
		const selectedLanguageOption = languages.find((language) => language.name === value)
		if (selectedLanguageOption) {
			setTotalFilteredStations(selectedLanguageOption.stationCount)
		}
	}

	// Apply tag filter
	const handleTagChange = (value: string) => {
		// Reset other filters
		setSelectedCountry("all")
		setSelectedLanguage("all")
		setSearchTerm("")
		setSearchInput("")

		setSelectedTag(value)
		setActiveFilter(value === "all" ? null : "tag")

		// Find the selected tag's station count
		const selectedTagOption = tags.find((tag) => tag.name === value)
		if (selectedTagOption) {
			setTotalFilteredStations(selectedTagOption.stationCount)
		}
	}

	// Apply search filter
	const handleSearch = (term: string) => {
		setSearchTerm(term)

		if (term) {
			// Reset other filters
			setSelectedCountry("all")
			setSelectedLanguage("all")
			setSelectedTag("all")

			setActiveFilter("search")
		} else {
			setActiveFilter(null)
			setTotalFilteredStations(stationCount)
		}
	}

	// Pagination controls
	const paginate = (pageNumber: number) => {
		if (pageNumber >= 1 && pageNumber <= Math.ceil(totalFilteredStations / stationsPerPage)) {
			setCurrentPage(pageNumber)
		}
	}

	return (
		<div className='station-selector'>
			<div className={"title"}>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
					<title>Radio Explorer Logo</title>
					<rect width='64' height='64' rx='12' fill='#2E3440' />
					<circle cx='32' cy='32' r='24' fill='none' stroke='#88C0D0' stroke-width='2.5' stroke-dasharray='4 4' />
					<path d='M 22,16 L 22,48 L 50,32 Z' fill='#ECEFF4' />
				</svg>
				<h2>Radio Explorer</h2>
			</div>

			<div className='divider' />

			<button
				type='button'
				className={`tab ${activeTab === "favorites" ? "active-tab" : ""}`}
				onClick={() => handleTabChange("favorites")}
			>
				Favorites
			</button>
			<button
				type='button'
				className={`tab ${activeTab === "recent" ? "active-tab" : ""}`}
				onClick={() => handleTabChange("recent")}
			>
				Last listened
			</button>
			<button
				type='button'
				className={`tab ${activeTab === "explore" ? "active-tab" : ""}`}
				onClick={() => handleTabChange("explore")}
			>
				Explore
			</button>

			<div className='divider' />

			<div className='search-bar'>
				<input
					type='text'
					placeholder='Search'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					className={`search-input ${activeFilter === "search" ? "active-filter" : ""}`}
				/>
			</div>

			<div className='divider' />

			<div className={`filter-group hidden-input-group ${activeFilter === "country" ? "active-filter" : ""}`}>
				<label htmlFor='country'>Country</label>
				<select id='country' value={selectedCountry} onChange={(e) => handleCountryChange(e.target.value)}>
					<option value='all'>All</option>
					{countries
						.filter((country) => country.name !== "all")
						.map((country) => (
							<option key={country.name} value={country.name}>
								{country.name} ({country.stationCount})
							</option>
						))}
				</select>
			</div>

			<div className={`filter-group hidden-input-group ${activeFilter === "language" ? "active-filter" : ""}`}>
				<label htmlFor='language'>Language</label>
				<select id='language' value={selectedLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
					<option value='all'>All</option>
					{languages
						.filter((language) => language.name !== "all")
						.map((language) => (
							<option key={language.name} value={language.name}>
								{language.name} ({language.stationCount})
							</option>
						))}
				</select>
			</div>

			<div className={`filter-group hidden-input-group ${activeFilter === "tag" ? "active-filter" : ""}`}>
				<label htmlFor='genre'>Genre</label>
				<select
					id='genre'
					value={selectedTag}
					onChange={(e) => handleTagChange(e.target.value)}
					className={activeFilter === "tag" ? "active-filter" : ""}
				>
					<option value='all'>All</option>
					{tags
						.filter((tag) => tag.name !== "all")
						.map((tag) => (
							<option key={tag.name} value={tag.name}>
								{tag.name} ({tag.stationCount})
							</option>
						))}
				</select>
			</div>

			<div className='divider' />

			<div className='filter-group'>
				<label htmlFor='sort-by'>Sort by</label>
				<select id='sort-by' value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "votes" | "clickcount")}>
					<option value='votes'>Popularity</option>
					<option value='name'>Name</option>
					<option value='clickcount'>Listeners</option>
				</select>
			</div>

			{activeTab === "explore" && (
				<div className='pagination'>
					<label htmlFor='current-page'>Page</label>
					<button
						type='button'
						onClick={() => paginate(currentPage - 1)}
						disabled={currentPage === 1}
						className='page-button'
					>
						<svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
							<title>chevron left</title>
							<polyline
								points='14 6 8 12 14 18'
								fill='none'
								stroke='currentColor'
								stroke-width='2'
								stroke-linecap='round'
								stroke-linejoin='round'
							/>
						</svg>
					</button>

					<span className='page-info'>
						<input
							id='current-page'
							type='text'
							onChange={(ev) => paginate(Number.parseInt(ev.target.value))}
							value={currentPageInput}
						/>
					</span>

					<button
						type='button'
						onClick={() => paginate(currentPage + 1)}
						disabled={currentPage >= Math.ceil(totalFilteredStations / stationsPerPage)}
						className='page-button'
					>
						<svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
							<title>chevron right</title>
							<polyline
								points='10 6 16 12 10 18'
								fill='none'
								stroke='currentColor'
								stroke-width='2'
								stroke-linecap='round'
								stroke-linejoin='round'
							/>
						</svg>
					</button>

					<span> of {Math.ceil(totalFilteredStations / stationsPerPage)}</span>
				</div>
			)}
		</div>
	)
}

export default StationSelector
