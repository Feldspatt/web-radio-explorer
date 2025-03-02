import React, { useState } from 'react';
import RadioPlayer from '../RadioPlayer/RadioPlayer.tsx';
import StationSelector from '../StationSelector/StationSelector.tsx';
import './RadioApp.css';
import {ThemeContext, ThemeProvider} from "../Theme/ThemeContext.tsx";
import ThemeToggle from "../Theme/ThemeToggle.tsx";

interface RadioStation {
    stationuuid: string;
    name: string;
    url: string;
    favicon: string;
    tags: string;
    country: string;
    language: string;
    codec: string;
    bitrate: number;
    votes: number;
    clickcount: number;
}

const RadioApp: React.FC = () => {
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);

    const handleStationSelect = (station: RadioStation) => {
        setSelectedStation(station);
    };

    return (
        <ThemeProvider>
        <div className="radio-app">
            <ThemeToggle/>
            <header className="app-header">
                <h1>Web Radio Explorer</h1>
                <p>Discover and listen to radio stations from around the world</p>
            </header>

            <div className="app-content">
                <StationSelector onStationSelect={handleStationSelect} />

                {selectedStation ? (
                    <RadioPlayer
                        sourceUrl={selectedStation.url}
                        stationName={selectedStation.name}
                    />
                ) : (
                    <div className="no-station-selected">
                        <div className="empty-state">
                            <div className="icon">📻</div>
                            <h2>Select a station to start listening</h2>
                            <p>Browse and filter stations from the list above</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </ThemeProvider>
    );
};

export default RadioApp;