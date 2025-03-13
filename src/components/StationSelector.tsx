import "../style/StationSelector.css"
import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useFilters } from "../hooks/useFilters.ts"
import { SvgDelete } from "./SvgCancel.tsx"
import { IconButton } from "./IconButton.tsx"

type StationSelectorProps = {
	stationsPerPage: number
	onStationsUpdate: (stationSelector: StationSelector) => void
}

const getDefaultFilter = (): Partial<Filter> => ({ order: "votes" })

const StationSelector: React.FC<StationSelectorProps> = ({ onStationsUpdate, stationsPerPage }) => {
	const [source, setSource] = useState<StationSource>("search")
	const [filter, setFilter] = useState<Partial<Filter>>(getDefaultFilter())
	const [page, setPage] = useState<number>(1)
	const { countries, languages, tags } = useFilters()

	const handleSourceChange = useCallback(
		(newSource: StationSource) => {
			if (source !== "search") setFilter(getDefaultFilter())
			setSource(newSource)
		},
		[source]
	)

	const handleFilterChange = useCallback((newFilter: Partial<Filter>) => {
		setSource("search")
		setPage(1)
		setFilter((prevFilter) => ({ ...prevFilter, ...newFilter, offset: undefined }))
	}, [])

	const handlePageChange = useCallback(
		(rawPage: number) => {
			const newPage: number = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
			if (page === newPage) return

			setPage(newPage)
			if (newPage === 1) {
				filter.offset = undefined
				setFilter({ ...filter })
				return
			}
			setFilter({ ...filter, offset: ((newPage - 1) * stationsPerPage).toString() })
		},
		[stationsPerPage, filter, page]
	)

	useEffect(() => {
		console.log(`station selection updated, source: ${source}, filter: ${JSON.stringify(filter, null, 2)}`)
		onStationsUpdate({ source, filter: filter })
	}, [source, filter, onStationsUpdate])

	return (
		<div className='station-selector'>
			<div className={"title"}>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
					<title>Radio Explorer Logo</title>
					<rect width='64' height='64' rx='12' fill='#2E3440' />
					<circle cx='32' cy='32' r='24' fill='none' stroke='#88C0D0' strokeWidth='2.5' strokeDasharray='4 4' />
					<path d='M 22,16 L 22,48 L 50,32 Z' fill='#ECEFF4' />
				</svg>
				<h2>Radio Explorer</h2>
			</div>

			<div className='divider' />

			<button
				type='button'
				className={`tab ${source === "favorite" ? "active-tab" : ""}`}
				onClick={() => handleSourceChange("favorite")}
			>
				Favorites
			</button>
			<button
				type='button'
				className={`tab ${source === "recent" ? "active-tab" : ""}`}
				onClick={() => handleSourceChange("recent")}
			>
				Last listened
			</button>
			<button
				type='button'
				className={`tab ${source === "search" ? "active-tab" : ""}`}
				onClick={() => handleSourceChange("search")}
			>
				Explore
			</button>

			<div className='divider' />

			<div className='search-bar'>
				<input
					type='text'
					placeholder='Search'
					value={filter.name ?? ""}
					onChange={(e) => handleFilterChange({ name: e.target.value })}
					className={`search-input ${filter.name ? "active-filter" : ""}`}
				/>
			</div>

			<div className='divider' />

			<div className={`filter-group hidden-input-group ${filter.country ? "active-filter" : ""}`}>
				<label htmlFor='country'>Country</label>
				<div>
					<select
						id='country'
						value={filter.country ?? ""}
						onChange={(e) => handleFilterChange({ country: e.target.value })}
					>
						<option value=''>All</option>
						{countries.map((country) => (
							<option key={`country-filter-${country.name}`} value={country.name}>
								{country.name} ({country.stationCount})
							</option>
						))}
					</select>
					<button className={"filter-group-delete"} type='button' onClick={() => handleFilterChange({ country: undefined })}>
						<SvgDelete />
					</button>
				</div>
			</div>

			<div className={`filter-group hidden-input-group ${filter.language ? "active-filter" : ""}`}>
				<label htmlFor='language'>Language</label>
				<div>
					<select
						id='language'
						value={filter.language ?? ""}
						onChange={(e) => handleFilterChange({ language: e.target.value })}
					>
						<option value=''>All</option>
						{languages.map((language) => (
							<option key={`language-filter-${language.name}`} value={language.name}>
								{language.name} ({language.stationCount})
							</option>
						))}
					</select>
					<button
						className={"filter-group-delete"}
						type='button'
						onClick={() => handleFilterChange({ language: undefined })}
					>
						<SvgDelete />
					</button>
				</div>
			</div>

			<div className={`filter-group hidden-input-group ${filter.tag ? "active-filter" : ""}`}>
				<label htmlFor='genre'>Genre</label>
				<div>
					<select id='genre' value={filter.tag ?? ""} onChange={(e) => handleFilterChange({ tag: e.target.value })}>
						<option value=''>All</option>
						{tags.map((tag) => (
							<option key={`tag-filter-${tag.name}`} value={tag.name}>
								{tag.name} ({tag.stationCount})
							</option>
						))}
					</select>
					<button className={"filter-group-delete"} type='button' onClick={() => handleFilterChange({ tag: undefined })}>
						<SvgDelete />
					</button>
				</div>
			</div>

			<div className='divider' />

			<div className='filter-group'>
				<label htmlFor='sort-by'>Sort by</label>
				<div className='visible-group'>
					<select
						id='sort-by'
						value={filter.order}
						onChange={(e) => handleFilterChange({ order: e.target.value as "name" | "votes" | "clickcount" })}
					>
						<option value='votes'>Popularity</option>
						<option value='name'>Name</option>
						<option value='clickcount'>Listeners</option>
					</select>
				</div>
			</div>

			<div className='pagination filter-group'>
				<label htmlFor='current-page'>Page</label>
				<div className='visible-group'>
					<IconButton disabled={page === 0} handleClick={() => handlePageChange(page - 1)}>
						<svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
							<title>chevron left</title>
							<polyline
								points='14 6 8 12 14 18'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</IconButton>

					<span className='page-info'>
						<input
							id='current-page'
							type='text'
							onChange={(event) => handlePageChange(Number.parseInt(event.target.value))}
							value={page}
						/>
					</span>

					<IconButton handleClick={() => handlePageChange(page + 1)}>
						<svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
							<title>chevron right</title>
							<polyline
								points='10 6 16 12 10 18'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</IconButton>
				</div>
			</div>
		</div>
	)
}

export default StationSelector
