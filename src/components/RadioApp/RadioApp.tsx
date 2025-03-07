import React, {useEffect, useState} from 'react';
import RadioPlayer from '../RadioPlayer/RadioPlayer.tsx';
import StationSelector from '../StationSelector/StationSelector.tsx';
import './RadioApp.css';
import {ThemeProvider} from "../Theme/ThemeContext.tsx";
import ThemeToggle from "../Theme/ThemeToggle.tsx";
import ServerPicker from "../ServerPicker.tsx";
import {paths} from "../../services/path.service.ts";
import StationList from "../StationList/StationList.tsx";

const RadioApp: React.FC = () => {
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null)
    const [stations, setStations] = useState<RadioStation[]>([])
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null)

    useEffect(() => {
        if(selectedServer) {
            paths.setServer(selectedServer.name)
            console.log('Selected server', selectedServer.name)
        }
    }, [selectedServer])

    const onStationsUpdate = (stations: RadioStation[], totalPages: number, currentOage: number) => {
        setStations(stations)
        setCurrentPage(currentOage)
        setTotalPages(totalPages)
    }

    return (
        <ThemeProvider>
            {!selectedServer ?  <ServerPicker onServerSelected={(server)=>setSelectedServer(server)}></ServerPicker>:
                <>
        <div className="radio-app">
            <ThemeToggle/>
            <header className="app-header">
                <h1>Web Radio Explorer</h1>
                <p>Discover and listen to radio stations from around the world</p>
            </header>

            <div className="app-content">
                {selectedStation ? (
                    <RadioPlayer
                        station={selectedStation}
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
                <StationSelector
                    stationsPerPage={20}
                    stationCount={selectedServer.stations}
                    onStationsUpdate={onStationsUpdate}
                />
                <StationList
                    stations={stations}
                    favoriteStations={[]}
                    onStationSelect={(station)=>setSelectedStation(station)}
                    onToggleFavorite={()=>{}}
                />
            </div>
        </div>
                </>
            }
                </ThemeProvider>
    );
};

export default RadioApp;