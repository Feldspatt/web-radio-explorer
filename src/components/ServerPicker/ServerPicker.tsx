import { useState, useEffect } from 'react';
import { paths } from "../../services/path.service.ts";
import './ServerPicker.css'

interface RadioBrowserServerSelectorProps {
    onServerSelected?: (server: Server) => void;
}

const RadioBrowserServerSelector = ({ onServerSelected }: RadioBrowserServerSelectorProps) => {
    const [servers, setServers] = useState<Omit<Server,'stations'>[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [checkedServers, setCheckedServers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if(servers.length === 0) {
            fetchServers().then()
        }
    }, []);

    const fetchServers = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Using the all.api domain which should redirect to a working server
            const response = await fetch(paths.getServers());

            if (!response.ok) {
                throw new Error(`Failed to fetch servers: ${response.status}`);
            }

            const data: [] = await response.json()
            console.log(`Found ${data.length} servers`)
            setServers(data);

            // Select a random server if available
            if (data.length > 0) {
                await selectRandomServer(data);
            } else {
                setErrorMessage("No servers available");
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error fetching radio browser servers:', err);
            if(err instanceof Error) setErrorMessage(err.message);
            setIsLoading(false);
        }
    };

    const selectRandomServer = async (serverList: Omit<Server, 'stations'>[]) => {
        // Filter out servers we've already checked and failed
        const availableServers = serverList.filter(server => !checkedServers.has(server.name));

        if (availableServers.length === 0) {
            // If we've tried all servers, reset and try again
            setCheckedServers(new Set());
            setErrorMessage("All servers unavailable. Retrying with full list.");
            await selectRandomServer(serverList);
            return;
        }

        // Select a random server from available ones
        const randomIndex = Math.floor(Math.random() * availableServers.length);
        const randomServer = availableServers[randomIndex];

        console.debug('randomly selected server:', randomServer.name);
        // Test if the server is operational
        try {
            const response = await fetch(paths.getServerStats(randomServer.name));

            if (!response.ok) throw new Error(`Failed to fetch servers: ${response.status}`)

            const stats = await response.json()
            if(stats.status !== 'OK') throw new Error(`Server is not ok: ${stats.status}`);

                // Call the callback with the selected server
                if (onServerSelected) {
                    await new Promise(resolve => { setTimeout(resolve, 1000) })
                    onServerSelected({...randomServer, stations: stats.stations - stats.stations_broken });
                }
                setIsLoading(false)
                console.log(`${randomServer.name} is operational`);
                return
        } catch (err) {
            // Mark this server as checked/failed
            const newCheckedServers = new Set(checkedServers);
            newCheckedServers.add(randomServer.name);
            setCheckedServers(newCheckedServers);

            // Try another server
            console.error(`Server ${randomServer.name} failed:`, err);
            await selectRandomServer(serverList);
        }
    }

    if (errorMessage && !isLoading) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {errorMessage}
                <button
                    className="ml-4 px-2 py-1 bg-red-200 hover:bg-red-300 rounded"
                    onClick={fetchServers}
                >
                    Retry
                </button>
            </div>
        );
    }

    if(isLoading) {
        return <object type="image/svg+xml" data="/splash_art.svg">Your browser does not support SVG</object>
    }

    if (servers.length === 0) {
        return <div className="p-4 text-center">No servers available</div>;
    }

    return <object type="image/svg+xml" data="/splash_art.svg">Your browser does not support SVG</object>
};

export default RadioBrowserServerSelector;