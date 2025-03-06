import React, { useState, useEffect } from 'react';
import './StationSelector.css';
import {paths} from "../../services/path.service.ts";


interface StationSelectorProps {
    onStationSelect: (station: RadioStation) => void;
    stationCount: number;
    stationsPerPage: number;
}

const StationSelector: React.FC<StationSelectorProps> = ({
                                                             onStationSelect, stationCount, stationsPerPage
                                                         }) => {
    const [filteredStations, setFilteredStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favoriteStations, setFavoriteStations] = useState<string[]>([])

    // Filter states
    const [countries, setCountries] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [tags, setTags] = useState<{name: string, stationCount: number}[]>([]);
    const [favorites] = useState<boolean>(true);

    // Selected filters
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Sort options
    const [sortBy, setSortBy] = useState<'name' | 'votes' | 'clickcount'>('votes');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        console.log('loading favorites...')
        const savedStations = window.localStorage.getItem('favorite_stations')
        if(savedStations) setFavoriteStations(savedStations.split(','))
    }, [])

    // Fetch countries, languages, and tags on mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {

                const [ countriesResponse, languagesResponse, tagsResponse] = await Promise.all([
                    fetch(paths.getCountries()),
                    fetch(paths.getLanguages()),
                    fetch(paths.getTags()),
                ])

                // Fetch countries
                const countriesData = await countriesResponse.json();
                const countryNames = countriesData
                    .filter((item: any) => item.name && item.stationcount > 5)
                    .map((item: any) => item.name)
                    .sort();
                setCountries(['all', ...countryNames])

                // Fetch languages
                const languagesData = await languagesResponse.json();
                const languageNames = languagesData
                    .filter((item: any) => item.name && item.stationcount > 5)
                    .map((item: any) => item.name)
                    .sort();
                setLanguages(['all', ...languageNames])

                // Fetch tags
                const tagsData = await tagsResponse.json();
                const tags = tagsData
                    .filter((item: any) => item.name && item.stationcount > 10)
                    .map((item: any) => item.name)
                    .sort((a, b)=> a.name.localeCompare(b.name));
                setTags(['all', ...tags])
            } catch (err) {
                console.error('Failed to load filter options. Please try again later. ' + err)
                setError('Failed to load filter options. Please try again later.')
            }
        };

        fetchMetadata().then()
    }, []);

    useEffect(()=> {
        const fetchStations = async ()=> {
            try {
                const response = await fetch(paths.getByUUID(favoriteStations));
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Filter out stations with invalid URLs
                const validStations = data.filter((station: RadioStation) =>
                    station.url &&
                    station.url.trim() !== '' &&
                    (station.url.startsWith('http://') || station.url.startsWith('https://'))
                );

                setFilteredStations(validStations);
                setCurrentPage(1);
            } catch (err) {
                setError('Failed to load stations. Please try again later.');
                setFilteredStations([]);
            } finally {
                setLoading(false);
            }
        }

        fetchStations()
    }, [favorites]);

    // Fetch stations based on filters and pagination
    useEffect(() => {
        const fetchStations = async () => {
            setLoading(true);
            setError(null);

            // Calculate offset based on current page
            const offset = (currentPage - 1) * stationsPerPage;

            // Add filters to URL
            const params = new URLSearchParams();

            if (selectedCountry !== 'all') {
                params.append('country', selectedCountry);
            }

            if (selectedLanguage !== 'all') {
                params.append('language', selectedLanguage);
            }

            if (selectedTag !== 'all') {
                params.append('tag', selectedTag);
            }

            if (searchTerm) {
                params.append('name', searchTerm);
            }

            // Sort by popularity by default
            params.append('order', sortBy);
            params.append('reverse', 'true');
            params.append('hidebroken', 'true');
            params.append('offset', offset.toString());
            params.append('limit', stationsPerPage.toString());

            try {
                const response = await fetch(paths.getStationSearch(params));
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Assuming the API now returns an object with stations and total
                // If the API returns an array directly, adjust accordingly
                const stationsData = Array.isArray(data) ? data : data.stations;

                // Filter out stations with invalid URLs
                const validStations = stationsData.filter((station: RadioStation) =>
                    station.url &&
                    station.url.trim() !== '' &&
                    (station.url.startsWith('http://') || station.url.startsWith('https://'))
                );

                setFilteredStations(validStations);
            } catch (err) {
                setError('Failed to load stations. Please try again later.');
                setFilteredStations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, [selectedCountry, selectedLanguage, selectedTag, sortBy, currentPage, stationsPerPage, searchTerm]);

    // Handle search - reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCountry, selectedLanguage, selectedTag]);

    // Calculate total pages based on total stations
    const totalPages = Math.ceil(stationCount / stationsPerPage);

    // Pagination controls
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Handle station selection
    const handleStationSelect = (station: RadioStation) => {
        onStationSelect(station);
    };

    const handleFavoriteClick= (event: React.MouseEvent<HTMLSpanElement>, uuid: string)=>{
        event.preventDefault()
        const index = favoriteStations.indexOf(uuid)
        if (index > -1) favoriteStations.splice(index, 1)
        else favoriteStations.push(uuid)

        setFavoriteStations([...favoriteStations]);
        window.localStorage.setItem('favorite_stations', favoriteStations.join(','));
    }

    const handleVote = async (event: React.MouseEvent<HTMLSpanElement>, uuid: string) => {
        event.preventDefault()

        let url = paths.getVote(uuid);

        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error sending vote: ${error}`);
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <div className="station-selector">
                <h2>Explore</h2>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search stations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filters">
                    <div className="filter-group">
                        <label>Country:</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Language:</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            {languages.map(language => (
                                <option key={language} value={language}>{language}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Genre:</label>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                        >
                            {tags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'votes' | 'clickcount')}
                        >
                            <option value="votes">Popularity</option>
                            <option value="name">Name</option>
                            <option value="clickcount">Listeners</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading stations...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : filteredStations.length === 0 ? (
                    <div className="no-results">No stations found. Try different filters.</div>
                ) : (
                    <>
                        <div className="stations-list">
                            {filteredStations.map(station => (
                                <div
                                    key={station.stationuuid}
                                    className="station-item"
                                    onClick={() => handleStationSelect(station)}
                                >
                                    <div className="station-logo">
                                        {station.favicon ? (
                                            <img
                                                src={station.favicon}
                                                alt={`${station.name} logo`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 16.3c2.1-1.4 4.5-2.2 7-2.2s4.9.8 7 2.2"/></svg>';
                                                }}
                                            />
                                        ) : (
                                            <div className="default-logo">📻</div>
                                        )}
                                    </div>

                                    <div className="station-info">
                                        <h3 className="station-name">{station.name}</h3>
                                        <div className="station-details">
                                            <span>{station.country}</span>
                                            {station.language && <span> • {station.language}</span>}
                                            {station.bitrate > 0 && <span> • {station.bitrate} kbps</span>}
                                        </div>
                                        {station.tags && (
                                            <div className="station-tags">
                                                {station.tags.split(',').slice(0, 3).map(tag => (
                                                    <span key={tag} className="tag">{tag.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="symbols">
                        <span onClick={(event)=> {
                            event.stopPropagation()
                            handleFavoriteClick(event, station.stationuuid)
                        }} className={`symbol star ${(favoriteStations.includes(station.stationuuid)? 'selected' : '')}`} >★</span>
                                        <span><span onClick={(event)=>{
                                            event.stopPropagation()
                                            handleVote(event, station.stationuuid).then()
                                        }} className="symbol">👍</span> {station.votes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="page-button"
                                >
                                    &laquo; Prev
                                </button>

                                <span className="page-info">
                Page {currentPage} of {totalPages}
                </span>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="page-button"
                                >
                                    Next &raquo;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default StationSelector;