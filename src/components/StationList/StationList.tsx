import React, { useEffect, useState } from 'react';
import FavoriteButton from "../FavoriteButton/FavoriteButton.tsx";
import VoteButton from "../VoteButton/VoteButton.tsx";
import './StationList.css';

interface StationListProps {
    stations: RadioStation[];
    onStationSelect: (station: RadioStation) => void;
}

const StationList: React.FC<StationListProps> = ({
                                                     stations,
                                                     onStationSelect
                                                 }) => {
    // State to store favorite station UUIDs
    const [favoriteStations, setFavoriteStations] = useState<string[]>([]);

    // Load favorite stations from localStorage on component mount
    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('favorites');
            if (savedFavorites) {
                setFavoriteStations(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
            // Initialize with empty array if there's an error
            setFavoriteStations([]);
        }
    }, []);

    // Handle toggling a station as favorite
    const handleToggleFavorite = (uuid: string) => {
        try {
            // Create a new array based on current state
            let updatedFavorites: string[];

            if (favoriteStations.includes(uuid)) {
                // Remove from favorites if already present
                updatedFavorites = favoriteStations.filter(id => id !== uuid);
            } else {
                // Add to favorites if not present
                updatedFavorites = [...favoriteStations, uuid];
            }

            // Update state
            setFavoriteStations(updatedFavorites);

            // Save to localStorage
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error('Error updating favorites in localStorage:', error);
        }
    };

    // Handle station selection and update recently listened
    const handleStationSelect = (station: RadioStation) => {
        try {
            // Call the parent component's onStationSelect handler
            onStationSelect(station);

            // Get current recently listened list
            const savedRecent = localStorage.getItem('last_listened');
            let recentlyListened: string[] = savedRecent ? JSON.parse(savedRecent) : [];

            // Remove the station if it's already in the list
            recentlyListened = recentlyListened.filter(id => id !== station.stationuuid);

            // Add the station to the beginning of the list
            recentlyListened.unshift(station.stationuuid);

            // Limit to 10 most recent stations
            if (recentlyListened.length > 10) {
                recentlyListened = recentlyListened.slice(0, 10);
            }

            // Save to localStorage
            localStorage.setItem('last_listened', JSON.stringify(recentlyListened));
        } catch (error) {
            console.error('Error updating recently listened in localStorage:', error);
            // Still call onStationSelect even if localStorage update fails
            onStationSelect(station);
        }
    };

    return (
        <div className="stations-list card">
            {stations.map(station => (
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
                        <FavoriteButton
                            uuid={station.stationuuid}
                            isFavorite={favoriteStations.includes(station.stationuuid)}
                            onToggleFavorite={handleToggleFavorite}
                        />
                        <VoteButton uuid={station.stationuuid} votes={station.votes} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StationList;