import "../style/StationSelector.css"
import type React from "react"
import { useState, useEffect } from "react"
import { useFilters } from "../hooks/useFilters.ts"

type StationSelectorProps = {
	stationsPerPage: number
	onStationsUpdate: (stationSelector: StationSelector) => void
}

const StationSelector: React.FC<StationSelectorProps> = ({ onStationsUpdate }) => {
	const [source, setSource] = useState<StationSource>("search")
	const [filter, setFilter] = useState<Partial<Filter>>({ order: "votes" })
	const { countries, languages, tags } = useFilters()

	const handleTabChange = (source: StationSource) => {
		setSource(source)
	}

	const handleFilterChange = (filterUpdate: Partial<Filter>) => {
		setFilter((prevFilter) => ({ ...prevFilter, ...filterUpdate }))
	}

	useEffect(() => {
		console.log("station selection updated")
		onStationsUpdate({ source, filter })
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
				onClick={() => handleTabChange("favorite")}
			>
				Favorites
			</button>
			<button
				type='button'
				className={`tab ${source === "recent" ? "active-tab" : ""}`}
				onClick={() => handleTabChange("recent")}
			>
				Last listened
			</button>
			<button
				type='button'
				className={`tab ${source === "search" ? "active-tab" : ""}`}
				onClick={() => handleTabChange("search")}
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
				<select id='country' value={filter.country} onChange={(e) => handleFilterChange({ country: e.target.value })}>
					<option value=''>All</option>
					{countries
						.filter((country) => country.name !== "all")
						.map((country) => (
							<option key={`country-filter-${country.name}`} value={country.name}>
								{country.name} ({country.stationCount})
							</option>
						))}
				</select>
			</div>

			<div className={`filter-group hidden-input-group ${filter.language ? "active-filter" : ""}`}>
				<label htmlFor='language'>Language</label>
				<select id='language' value={filter.language} onChange={(e) => handleFilterChange({ language: e.target.value })}>
					<option value=''>All</option>
					{languages
						.filter((language) => language.name !== "all")
						.map((language) => (
							<option key={`language-filter-${language.name}`} value={language.name}>
								{language.name} ({language.stationCount})
							</option>
						))}
				</select>
			</div>

			<div className={`filter-group hidden-input-group ${filter.tag ? "active-filter" : ""}`}>
				<label htmlFor='genre'>Genre</label>
				<select id='genre' value={filter.tag} onChange={(e) => handleFilterChange({ tag: e.target.value })}>
					<option value=''>All</option>
					{tags
						.filter((tag) => tag.name !== "all")
						.map((tag) => (
							<option key={`tag-filter-${tag.name}`} value={tag.name}>
								{tag.name} ({tag.stationCount})
							</option>
						))}
				</select>
			</div>

			<div className='divider' />

			<div className='filter-group'>
				<label htmlFor='sort-by'>Sort by</label>
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

			{source === "search" && (
				<div className='pagination'>
					<label htmlFor='current-page'>Page</label>
					<button type='button' onClick={() => console.log("page -1")} className='page-button'>
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
					</button>

					<span className='page-info'>
						<input id='current-page' type='text' onChange={() => console.log("page input")} value={filter.offset ?? "1"} />
					</span>

					<button type='button' onClick={() => console.log("page + 1 ")} className='page-button'>
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
					</button>
				</div>
			)}
		</div>
	)
}

export default StationSelector
