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
    const [selectedServer, setSelectedServer] = useState<Server | null>(null)

    useEffect(() => {
        if(selectedServer) {
            paths.setServer(selectedServer.name)
            console.log('Selected server', selectedServer.name)
        }
    }, [selectedServer])

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
            <RadioPlayer station={selectedStation}/>
            <StationList
                stations={stations}
                onStationSelect={(station)=>setSelectedStation(station)}
            />
            <StationSelector
                stationsPerPage={20}
                stationCount={selectedServer.stations}
                onStationsUpdate={(stations)=>setStations(stations)}
            />
        </div>
                </>
            }
                </ThemeProvider>
    );
};

export default RadioApp;