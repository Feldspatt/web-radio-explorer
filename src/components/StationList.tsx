import type React from "react"
import "../style/StationList.css"
import { cut } from "../services/cut.ts"
import { SvgRadio } from "./SvgRadio.tsx"
import { getFavoritesList, getVotes, storeVote, toggleFavorite } from "../services/storage.ts"
import { useCallback, useEffect, useState } from "react"
import { fetchStations } from "../services/fetchStations"
import { IconButton } from "./IconButton.tsx"
import { paths } from "../services/path.service.ts"

interface StationListProps {
	source: StationSource
	filter?: Partial<Filter>
	onStationSelect: (station: RadioStation) => void
}

const StationList: React.FC<StationListProps> = ({ source, filter, onStationSelect }) => {
	const [stations, setStations] = useState<RadioStation[]>([])
	const [favorites, setFavorites] = useState<string[]>([])
	const [votes, setVotes] = useState<string[]>([])

	useEffect(() => {
		const getStations = async () => {
			console.log(`fetching stations list from ${source}...`)
			const newStations = await fetchStations({ source, filter })
			setStations(newStations)
		}

		getStations().then(() => console.log("stations list fetched."))

		setFavorites(getFavoritesList())
		setVotes(getVotes())
	}, [source, filter])

	const handleFavoriteClick = useCallback((uuid: string) => {
		const favorites = toggleFavorite(uuid)
		setFavorites(favorites)
		console.log(`favorites length: ${favorites.length}`)
	}, [])

	const handleVoteClick = useCallback(
		async (uuid: string) => {
			if (votes.includes(uuid)) return
			try {
				const voteResponse = await fetch(paths.sendVote(uuid))
				if (!voteResponse.ok) {
					console.error(`vote failed: ${await voteResponse.text()}`)
					return
				}
				setVotes(storeVote(uuid))
			} catch (error) {
				console.error(`vote failed: ${error}`)
			}
		},
		[votes]
	)

	return (
		<div className='station-list'>
			<ul className='station-list-wrapper'>
				{stations.map((station) => (
					<li key={`station-list-${station.stationuuid}`} className='card'>
						{station.favicon ? (
							<img
								src={station.favicon}
								alt={`${station.name} logo`}
								onError={(e) => {
									;(e.target as HTMLImageElement).src =
										'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 16.3c2.1-1.4 4.5-2.2 7-2.2s4.9.8 7 2.2"/></svg>'
								}}
								className='station-logo'
							/>
						) : (
							<div className='station-logo default-logo'>
								<SvgRadio />
							</div>
						)}

						<div className='card-body'>
							<h4>{cut(station.name, 30)}</h4>
							<div>
								{station.bitrate > 0 && <span>{station.bitrate} kbps • </span>}
								<span>{cut(station.country, 15)}</span>
								{station.language && <span> • {cut(station.language, 15)}</span>}
							</div>
						</div>

						<button className='card-button' type='button' onClick={() => onStationSelect(station)} />

						<div className={"actions"}>
							<IconButton handleClick={() => {}}>
								<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'>
									<title>Detail</title>
									<path
										d='M14,3 L5,3 C3.89,3 3,3.89 3,5 L3,19 C3,20.11 3.89,21 5,21 L19,21 C20.11,21 21,20.11 21,19 L21,10 L14,3 Z'
										fill='none'
										stroke='currentColor'
										stroke-width='2'
										stroke-linejoin='round'
									/>
									<path d='M14,3 L14,10 L21,10' fill='none' stroke='currentColor' stroke-width='2' stroke-linejoin='round' />
									<line x1='7' y1='15' x2='17' y2='15' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' />
									<line x1='7' y1='18' x2='13' y2='18' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' />
								</svg>
							</IconButton>
							<IconButton
								handleClick={() => handleVoteClick(station.stationuuid)}
								isFilled={votes.includes(station.stationuuid)}
							>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<title>Vote</title>
									<path d='M14 9V5a3 3 0 0 0-3-3L7 11v9h10a3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3h-3z' />
									<path d='M7 11H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3' />
								</svg>
							</IconButton>
							<IconButton
								handleClick={() => handleFavoriteClick(station.stationuuid)}
								isFilled={favorites.includes(station.stationuuid)}
							>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<title>Favorite</title>
									<polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21 12 17.77 5.82 21 7 14.14 2 9.27 8.91 8.26 12 2' />
								</svg>
							</IconButton>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

export default StationList
