import React from 'react';
import FavoriteButton from "../FavoriteButton/FavoriteButton.tsx";
import VoteButton from "../VoteButton/VoteButton.tsx";
import './StationList.css'

interface StationListProps {
    stations: RadioStation[];
    favoriteStations: string[];
    onStationSelect: (station: RadioStation) => void;
    onToggleFavorite: (uuid: string) => void;
}

const StationList: React.FC<StationListProps> = ({
                                                     stations,
                                                     favoriteStations,
                                                     onStationSelect,
                                                     onToggleFavorite
                                                 }) => {
    return (
        <div className="stations-list card">
            {stations.map(station => (
                <div
                    key={station.stationuuid}
                    className="station-item"
                    onClick={() => onStationSelect(station)}
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
                            onToggleFavorite={onToggleFavorite}
                        />
                        <VoteButton uuid={station.stationuuid} votes={station.votes} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StationList;