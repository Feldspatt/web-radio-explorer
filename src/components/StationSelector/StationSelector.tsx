import React, { useState, useEffect } from 'react';
import './StationSelector.css';
import { paths } from "../../services/path.service.ts";

interface StationSelectorProps {
    stationCount: number;
    stationsPerPage: number;
    onStationsUpdate: (stations: RadioStation[], totalPages: number, currentPage: number) => void;
}

const StationSelector: React.FC<StationSelectorProps> = ({
                                                             stationCount, stationsPerPage, onStationsUpdate
                                                         }) => {
    const [filteredStations, setFilteredStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    // Update parent component with filtered stations
    useEffect(() => {
        const totalPages = Math.ceil(totalFilteredStations / stationsPerPage);
        onStationsUpdate(filteredStations, totalPages, currentPage);
    }, [filteredStations, totalFilteredStations, stationsPerPage, currentPage, onStationsUpdate]);

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

    // Fetch stations based on the active filter and pagination
    useEffect(() => {
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

            // Set reverse parameter based on sort type
            // For name, we want alphabetical order (A-Z), so reverse should be false
            // For votes and clickcount, we want highest first, so reverse should be true
            const shouldReverse = sortBy !== 'name';
            params.append('reverse', shouldReverse.toString());

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
    }, [activeFilter, selectedCountry, selectedLanguage, selectedTag, sortBy, currentPage, stationsPerPage, searchTerm]);

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

    // Pagination controls
    const paginate = (pageNumber: number) => {
        if(pageNumber >= 1) setCurrentPage(pageNumber);
    }

    return (
        <div className="station-selector card">
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
                        <option value="all">All</option>
                        {countries.filter(country => country.name !== 'all').map(country => (
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
                        <option value="all">All</option>
                        {languages.filter(language => language.name !== 'all').map(language => (
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
                        <option value="all">All</option>
                        {tags.filter(tag => tag.name !== 'all').map(tag => (
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
            </div>

            {/* Status indicators */}
            {loading && <div className="loading">Loading stations...</div>}
            {error && <div className="error">{error}</div>}

            {/* Pagination controls */}
            {!loading && !error && filteredStations.length > 0 && (
                <div className="pagination">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="page-button"
                    >
                        &laquo; Prev
                    </button>

                    <span className="page-info">
                        Page <input type="number" onChange={(ev) => paginate(parseInt(ev.target.value))} value={currentPage}/> of {Math.ceil(totalFilteredStations / stationsPerPage)}
                    </span>

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(totalFilteredStations / stationsPerPage)}
                        className="page-button"
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default StationSelector;