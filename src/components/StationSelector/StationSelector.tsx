import React, { useState, useEffect } from 'react';
import './StationSelector.css';
import { paths } from "../../services/path.service.ts";

interface StationSelectorProps {
    stationCount: number;
    stationsPerPage: number;
    onStationsUpdate: (stations: RadioStation[]) => void;
}

// Custom hook for debounce
const useDebounce = <T extends any>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

const StationSelector: React.FC<StationSelectorProps> = ({
                                                             stationCount, stationsPerPage, onStationsUpdate
                                                         }) => {
    // Tab state
    const [activeTab, setActiveTab] = useState<'explore' | 'favorites' | 'recent'>('explore');

    const [filteredStations, setFilteredStations] = useState<RadioStation[]>([]);
    const [totalFilteredStations, setTotalFilteredStations] = useState(stationCount);

    // Favorites and recently listened stations
    const [favorites, setFavorites] = useState<RadioStation[]>([]);
    const [recentlyListened, setRecentlyListened] = useState<RadioStation[]>([]);

    // Loading states
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [loadingRecent, setLoadingRecent] = useState(false);

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
    const [favoritesPage, setFavoritesPage] = useState(1);

    // Pagination input values (for debouncing)
    const [currentPageInput, setCurrentPageInput] = useState<string>("1");
    const [favoritesPageInput, setFavoritesPageInput] = useState<string>("1");

    // Search term
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Apply debounce to search and pagination
    const debouncedSearchTerm = useDebounce(searchInput, 500);
    const debouncedCurrentPageInput = useDebounce(currentPageInput, 500);
    const debouncedFavoritesPageInput = useDebounce(favoritesPageInput, 500);

    // Update actual values when debounced values change
    useEffect(() => {
        handleSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const pageNumber = parseInt(debouncedCurrentPageInput) || 1;
        if (pageNumber >= 1) {
            setCurrentPage(pageNumber);
        }
    }, [debouncedCurrentPageInput]);

    useEffect(() => {
        const pageNumber = parseInt(debouncedFavoritesPageInput) || 1;
        if (pageNumber >= 1 && pageNumber <= Math.ceil(favorites.length / stationsPerPage)) {
            setFavoritesPage(pageNumber);
        }
    }, [debouncedFavoritesPageInput, favorites.length, stationsPerPage]);

    // Helper function to convert HTTP URLs to HTTPS
    const convertHttpToHttps = (stations: RadioStation[]): RadioStation[] => {
        return stations.map(station => {
            if (station.url && station.url.startsWith('http://')) {
                return { ...station, url: station.url.replace('http://', 'https://') };
            }
            return station;
        });
    };

    // Fetch station details by UUID
    const fetchStationsByUUIDs = async (uuids: string[]): Promise<RadioStation[]> => {
        if (!uuids || uuids.length === 0) return [];

        try {
            const stationsPromises = await fetch(paths.getByUUID(uuids))
            if (!stationsPromises.ok) {
                throw new Error(`Failed to fetch stations with UUID: ${uuids}`);
            }

            const stations = await stationsPromises.json();
            // Convert HTTP URLs to HTTPS
            return convertHttpToHttps(stations);
        } catch (err) {
            console.error('Error fetching stations by UUIDs:', err);
            return [];
        }
    };

    // Load favorite stations from localStorage UUIDs
    const loadFavoriteStations = async () => {
        try {
            setLoadingFavorites(true);

            // Get favorite UUIDs from localStorage
            const favoriteUUIDs = JSON.parse(localStorage.getItem('favorites') || '[]');

            if (favoriteUUIDs.length > 0) {
                // Fetch station details for each UUID
                const favoriteStations = await fetchStationsByUUIDs(favoriteUUIDs);
                setFavorites(favoriteStations);
            } else {
                setFavorites([]);
            }
        } catch (err) {
            console.error('Error loading favorite stations:', err);
            setFavorites([]);
        } finally {
            setLoadingFavorites(false);
        }
    };

    // Load recently listened stations from localStorage UUIDs
    const loadRecentlyListenedStations = async () => {
        try {
            setLoadingRecent(true);

            // Get recently listened UUIDs from localStorage
            const recentUUIDs = JSON.parse(localStorage.getItem('last_listened') || '[]');

            // Limit to stationsPerPage
            const limitedUUIDs = recentUUIDs.slice(0, stationsPerPage);

            if (limitedUUIDs.length > 0) {
                // Fetch station details for each UUID
                const recentStations = await fetchStationsByUUIDs(limitedUUIDs);
                const orderedStations = []
                for (const uuid of limitedUUIDs) {
                    const station = recentStations.find(station => station.stationuuid === uuid);
                    if(station) orderedStations.push(station);
                }

                setRecentlyListened(orderedStations);
            } else {
                setRecentlyListened([]);
            }
        } catch (err) {
            console.error('Error loading recently listened stations:', err);
            setRecentlyListened([]);
        } finally {
            setLoadingRecent(false);
        }
    };

    // Handle tab change and reset pagination
    const handleTabChange = (tab: 'explore' | 'favorites' | 'recent') => {
        setActiveTab(tab);

        // Reset pagination when changing tabs
        if (tab === 'explore') {
            setCurrentPage(1);
            setCurrentPageInput("1");
        } else if (tab === 'favorites') {
            setFavoritesPage(1);
            setFavoritesPageInput("1");
            loadFavoriteStations().then();
        } else if (tab === 'recent') {
            loadRecentlyListenedStations().then();
        }
    };

    // Update parent component with stations based on active tab
    useEffect(() => {
        if (activeTab === 'explore') {
            onStationsUpdate(filteredStations);
        } else if (activeTab === 'favorites') {
            // Get paginated favorites
            const startIndex = (favoritesPage - 1) * stationsPerPage;
            const paginatedFavorites = favorites.slice(startIndex, startIndex + stationsPerPage);
            onStationsUpdate(paginatedFavorites);
        } else if (activeTab === 'recent') {
            onStationsUpdate(recentlyListened);
        }
    }, [filteredStations, favorites, recentlyListened, activeTab, favoritesPage, onStationsUpdate]);

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
            }
        };

        fetchMetadata().then();
    }, [stationCount]);

    // Fetch stations based on the active filter and pagination
    useEffect(() => {
        // Only fetch if we're on the explore tab
        if (activeTab !== 'explore') return;

        const fetchStations = async () => {
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

                // Filter out stations with invalid URLs and convert HTTP to HTTPS
                const validStations = stationsData
                    .filter((station: RadioStation) =>
                        station.url &&
                        station.url.trim() !== '' &&
                        (station.url.startsWith('http://') || station.url.startsWith('https://'))
                    )
                    .map((station: RadioStation) => {
                        if (station.url && station.url.startsWith('http://')) {
                            return { ...station, url: station.url.replace('http://', 'https://') };
                        }
                        return station;
                    });

                setFilteredStations(validStations);
            } catch (err) {
                setFilteredStations([]);
            }
        };

        fetchStations().then();
    }, [activeFilter, selectedCountry, selectedLanguage, selectedTag, sortBy, currentPage, stationsPerPage, searchTerm, activeTab]);

    // Update page input when page changes
    useEffect(() => {
        setCurrentPageInput(currentPage.toString());
    }, [currentPage]);

    useEffect(() => {
        setFavoritesPageInput(favoritesPage.toString());
    }, [favoritesPage]);

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
        setCurrentPageInput("1");
    }, [activeFilter, selectedCountry, selectedLanguage, selectedTag, searchTerm]);

    // Apply country filter
    const handleCountryChange = (value: string) => {
        // Reset other filters
        setSelectedLanguage('all');
        setSelectedTag('all');
        setSearchTerm('');
        setSearchInput('');

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
        setSearchInput('');

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
        setSearchInput('');

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
        if(pageNumber >= 1 && pageNumber <= Math.ceil(totalFilteredStations / stationsPerPage)) {
            setCurrentPage(pageNumber);
        }
    }

    // Favorites pagination
    const paginateFavorites = (pageNumber: number) => {
        if(pageNumber >= 1 && pageNumber <= Math.ceil(favorites.length / stationsPerPage)) {
            setFavoritesPage(pageNumber);
        }
    }

    return (
        <div className="station-selector card">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'explore' ? 'active-tab' : ''}`}
                    onClick={() => handleTabChange('explore')}
                >
                    Explore
                </button>
                <button
                    className={`tab ${activeTab === 'favorites' ? 'active-tab' : ''}`}
                    onClick={() => handleTabChange('favorites')}
                >
                    Favorites {favorites.length > 0 && `(${favorites.length})`}
                </button>
                <button
                    className={`tab ${activeTab === 'recent' ? 'active-tab' : ''}`}
                    onClick={() => handleTabChange('recent')}
                >
                    Last Listened {recentlyListened.length > 0 && `(${recentlyListened.length})`}
                </button>
            </div>

            {activeTab === 'explore' && (
                <>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search stations..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
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
                </>
            )}

            {(activeTab === 'favorites' || activeTab === 'recent') && (
                <div className="saved-stations-header">
                    <h3>{activeTab === 'favorites' ? 'Your Favorite Stations' : 'Recently Listened Stations'}</h3>
                </div>
            )}

            {activeTab === 'favorites' && favorites.length === 0 && !loadingFavorites && (
                <div className="empty-state">
                    <p>You haven't added any favorite stations yet.</p>
                    <p>Browse the Explore tab and click the heart icon to add favorites.</p>
                </div>
            )}

            {activeTab === 'favorites' && loadingFavorites && (
                <div className="loading-state">
                    <p>Loading your favorite stations...</p>
                </div>
            )}

            {activeTab === 'recent' && recentlyListened.length === 0 && !loadingRecent && (
                <div className="empty-state">
                    <p>Your recently listened stations will appear here.</p>
                    <p>Start listening to stations from the Explore tab.</p>
                </div>
            )}

            {activeTab === 'recent' && loadingRecent && (
                <div className="loading-state">
                    <p>Loading your recently listened stations...</p>
                </div>
            )}

            {/* Pagination for Explore tab - Always render but conditionally show */}
            {activeTab === 'explore' && (
                <div className="pagination" style={{ display: filteredStations.length > 0 ? 'flex' : 'none' }}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="page-button"
                    >
                        &laquo; Prev
                    </button>

                    <span className="page-info">
                        <input
                            type="text"
                            onChange={(ev) => setCurrentPageInput(ev.target.value)}
                            value={currentPageInput}
                        /> of {Math.ceil(totalFilteredStations / stationsPerPage)}
                    </span>

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(totalFilteredStations / stationsPerPage)}
                        className="page-button"
                    >
                        Next &raquo;
                    </button>
                </div>
            )}

            {/* Pagination for Favorites tab - Always render but conditionally show */}
            {activeTab === 'favorites' && !loadingFavorites && (
                <div className="pagination" style={{ display: favorites.length > stationsPerPage ? 'flex' : 'none' }}>
                    <button
                        onClick={() => paginateFavorites(favoritesPage - 1)}
                        disabled={favoritesPage === 1}
                        className="page-button"
                    >
                        &laquo; Prev
                    </button>

                    <span className="page-info">
                        <input
                            type="text"
                            onChange={(ev) => setFavoritesPageInput(ev.target.value)}
                            value={favoritesPageInput}
                        /> of {Math.ceil(favorites.length / stationsPerPage)}
                    </span>

                    <button
                        onClick={() => paginateFavorites(favoritesPage + 1)}
                        disabled={favoritesPage >= Math.ceil(favorites.length / stationsPerPage)}
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