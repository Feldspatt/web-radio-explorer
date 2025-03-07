import React, { useState, useEffect } from 'react';
import './StationSelector.css';
import {paths} from "../../services/path.service.ts";

interface FilterOption {
    name: string;
    stationCount: number;
}

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
    const [favoriteStations, setFavoriteStations] = useState<string[]>([]);
    const [totalFilteredStations, setTotalFilteredStations] = useState(stationCount);

    // Filter states with station counts
    const [countries, setCountries] = useState<FilterOption[]>([]);
    const [languages, setLanguages] = useState<FilterOption[]>([]);
    const [tags, setTags] = useState<FilterOption[]>([]);

    // Active filter
    const [activeFilter, setActiveFilter] = useState<'country' | 'language' | 'tag' | 'search' | 'favorite' | null>(null);

    // Filter values
    const [selectedCountry, setSelectedCountry] = useState<string>('all');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');

    // Sort options
    const [sortBy, setSortBy] = useState<'name' | 'votes' | 'clickcount'>('votes');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Search term
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        console.log('loading favorites...');
        const savedStations = window.localStorage.getItem('favorite_stations');
        if(savedStations) setFavoriteStations(savedStations.split(','));
    }, []);

    // Fetch countries, languages, and tags on mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [countriesResponse, languagesResponse, tagsResponse] = await Promise.all([
                    fetch(paths.getCountries()),
                    fetch(paths.getLanguages()),
                    fetch(paths.getTags()),
                ]);

                // Fetch countries
                const countriesData = await countriesResponse.json();
                const countryOptions = countriesData
                    .filter((item: any) => item.name && item.stationcount > 5)
                    .map((item: any) => ({
                        name: item.name,
                        stationCount: item.stationcount
                    }))
                    .sort((a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name));
                setCountries([{ name: 'all', stationCount: stationCount }, ...countryOptions]);

                // Fetch languages
                const languagesData = await languagesResponse.json();
                const languageOptions = languagesData
                    .filter((item: any) => item.name && item.stationcount > 5)
                    .map((item: any) => ({
                        name: item.name,
                        stationCount: item.stationcount
                    }))
                    .sort((a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name));
                setLanguages([{ name: 'all', stationCount: stationCount }, ...languageOptions]);

                // Fetch tags
                const tagsData = await tagsResponse.json();
                const tagOptions = tagsData
                    .filter((item: any) => item.name && item.stationcount > 10)
                    .map((item: any) => ({
                        name: item.name,
                        stationCount: item.stationcount
                    }))
                    .sort((a: FilterOption, b: FilterOption) => a.name.localeCompare(b.name));
                setTags([{ name: 'all', stationCount: stationCount }, ...tagOptions]);
            } catch (err) {
                console.error('Failed to load filter options. Please try again later. ' + err);
                setError('Failed to load filter options. Please try again later.');
            }
        };

        fetchMetadata().then();
    }, [stationCount]);

    useEffect(() => {
        // When using favorites filter
        if (activeFilter === 'favorite' && favoriteStations.length > 0) {
            const fetchStations = async () => {
                setLoading(true);
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
                    setTotalFilteredStations(validStations.length);
                    setCurrentPage(1);
                } catch (err) {
                    setError('Failed to load stations. Please try again later.');
                    setFilteredStations([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchStations();
        }
    }, [activeFilter, favoriteStations]);

    // Fetch stations based on the active filter and pagination
    useEffect(() => {
        if (activeFilter === 'favorite' && favoriteStations.length > 0) return; // Skip this effect for favorites

        const fetchStations = async () => {
            setLoading(true);
            setError(null);

            // Calculate offset based on current page
            const offset = (currentPage - 1) * stationsPerPage;

            // Add filters to URL
            const params = new URLSearchParams();

            // Apply the active filter
            if (activeFilter === 'country' && selectedCountry !== 'all') {
                params.append('country', selectedCountry);
            } else if (activeFilter === 'language' && selectedLanguage !== 'all') {
                params.append('language', selectedLanguage);
            } else if (activeFilter === 'tag' && selectedTag !== 'all') {
                params.append('tag', selectedTag);
            } else if (activeFilter === 'search' && searchTerm) {
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

                // Check if the API returns the total stations count
                if (data.hasOwnProperty('totalStationCount')) {
                    setTotalFilteredStations(data.totalStationCount);
                }

                // Assuming the API now returns an object with stations and total
                // If the API returns an array directly, adjust accordingly
                const stationsData = Array.isArray(data) ? data : (data.stations || data);

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
    }, [activeFilter, selectedCountry, selectedLanguage, selectedTag, sortBy, currentPage, stationsPerPage, searchTerm, favoriteStations]);

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, selectedCountry, selectedLanguage, selectedTag, searchTerm]);

    // Apply country filter
    const handleCountryChange = (value: string) => {
        // Reset other filters
        setSelectedLanguage('all');
        setSelectedTag('all');
        setSearchTerm('');

        setSelectedCountry(value);
        setActiveFilter(value === 'all' ? null : 'country');

        // Find the selected country's station count
        const selectedCountryOption = countries.find(country => country.name === value);
        if (selectedCountryOption) {
            setTotalFilteredStations(selectedCountryOption.stationCount);
        }
    };

    // Apply language filter
    const handleLanguageChange = (value: string) => {
        // Reset other filters
        setSelectedCountry('all');
        setSelectedTag('all');
        setSearchTerm('');

        setSelectedLanguage(value);
        setActiveFilter(value === 'all' ? null : 'language');

        // Find the selected language's station count
        const selectedLanguageOption = languages.find(language => language.name === value);
        if (selectedLanguageOption) {
            setTotalFilteredStations(selectedLanguageOption.stationCount);
        }
    };

    // Apply tag filter
    const handleTagChange = (value: string) => {
        // Reset other filters
        setSelectedCountry('all');
        setSelectedLanguage('all');
        setSearchTerm('');

        setSelectedTag(value);
        setActiveFilter(value === 'all' ? null : 'tag');

        // Find the selected tag's station count
        const selectedTagOption = tags.find(tag => tag.name === value);
        if (selectedTagOption) {
            setTotalFilteredStations(selectedTagOption.stationCount);
        }
    };

    // Apply search filter
    const handleSearch = (term: string) => {
        setSearchTerm(term);

        if (term) {
            // Reset other filters
            setSelectedCountry('all');
            setSelectedLanguage('all');
            setSelectedTag('all');

            setActiveFilter('search');
        } else {
            setActiveFilter(null);
            setTotalFilteredStations(stationCount);
        }
    };

    // Handle favorites filter
    const handleFavoritesClick = () => {
        // Reset other filters
        setSelectedCountry('all');
        setSelectedLanguage('all');
        setSelectedTag('all');
        setSearchTerm('');

        if (activeFilter === 'favorite') {
            setActiveFilter(null);
            setTotalFilteredStations(stationCount);
        } else {
            setActiveFilter('favorite');
            setTotalFilteredStations(favoriteStations.length);
        }
    };

    // Calculate total pages based on filtered stations count
    const totalPages = Math.ceil(totalFilteredStations / stationsPerPage);

    // Pagination controls
    const paginate = (pageNumber: number) => {
        if(pageNumber >= 1) setCurrentPage(pageNumber);
    }

    // Handle station selection
    const handleStationSelect = (station: RadioStation) => {
        onStationSelect(station);
    };

    const handleFavoriteClick = (event: React.MouseEvent<HTMLSpanElement>, uuid: string) => {
        event.preventDefault();
        const index = favoriteStations.indexOf(uuid);
        let updatedFavorites = [...favoriteStations];

        if (index > -1) {
            updatedFavorites.splice(index, 1);
        } else {
            updatedFavorites.push(uuid);
        }

        setFavoriteStations(updatedFavorites);
        window.localStorage.setItem('favorite_stations', updatedFavorites.join(','));
    };

    const handleVote = async (event: React.MouseEvent<HTMLSpanElement>, uuid: string) => {
        event.preventDefault();
        let url = paths.getVote(uuid);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error sending vote: ${error}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="station-selector">
                <h2>Explore</h2>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search stations..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`search-input ${activeFilter === 'search' ? 'active-filter' : ''}`}
                    />
                </div>

                <div className="filters">
                    <div className="filter-group">
                        <label>Country:</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className={activeFilter === 'country' ? 'active-filter' : ''}
                        >
                            {countries.map(country => (
                                <option key={country.name} value={country.name}>
                                    {country.name} ({country.stationCount})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Language:</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className={activeFilter === 'language' ? 'active-filter' : ''}
                        >
                            {languages.map(language => (
                                <option key={language.name} value={language.name}>
                                    {language.name} ({language.stationCount})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Genre:</label>
                        <select
                            value={selectedTag}
                            onChange={(e) => handleTagChange(e.target.value)}
                            className={activeFilter === 'tag' ? 'active-filter' : ''}
                        >
                            {tags.map(tag => (
                                <option key={tag.name} value={tag.name}>
                                    {tag.name} ({tag.stationCount})
                                </option>
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

                    <button
                        onClick={handleFavoritesClick}
                        className={`favorites-button ${activeFilter === 'favorite' ? 'active-filter' : ''}`}
                    >
                        My Favorites
                    </button>
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
                                        <span onClick={(event) => {
                                            event.stopPropagation();
                                            handleFavoriteClick(event, station.stationuuid);
                                        }} className={`symbol star ${(favoriteStations.includes(station.stationuuid) ? 'selected' : '')}`}>★</span>
                                        <span><span onClick={(event) => {
                                            event.stopPropagation();
                                            handleVote(event, station.stationuuid).then();
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
                                    Page <input type={"number"} onChange={(ev)=> paginate(parseInt(ev.target.value))} value={currentPage}/> of {totalPages}
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