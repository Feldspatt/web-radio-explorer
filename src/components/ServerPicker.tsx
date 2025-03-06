import { useState, useEffect } from 'react';
import { paths } from "../services/path.service.ts";

interface RadioBrowserServerSelectorProps {
    onServerSelected?: (server: Server) => void;
}

const RadioBrowserServerSelector = ({ onServerSelected }: RadioBrowserServerSelectorProps) => {
    const [servers, setServers] = useState<Server[]>([]);
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
                selectRandomServer(data);
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

    const selectRandomServer = async (serverList: Server[]) => {
        // Filter out servers we've already checked and failed
        const availableServers = serverList.filter(server => !checkedServers.has(server.name));

        if (availableServers.length === 0) {
            // If we've tried all servers, reset and try again
            setCheckedServers(new Set());
            setErrorMessage("All servers unavailable. Retrying with full list.");
            selectRandomServer(serverList);
            return;
        }

        // Select a random server from available ones
        const randomIndex = Math.floor(Math.random() * availableServers.length);
        const randomServer = availableServers[randomIndex];

        console.debug('randomly selected server:', randomServer.name);
        // Test if the server is operational
        try {
            const isOperational = await testServerConnection(randomServer);

            if (isOperational) {
                // Call the callback with the selected server
                if (onServerSelected) {
                    onServerSelected(randomServer);
                }
                setIsLoading(false)
                console.log(`${randomServer.name} is operational`);
                return
            }
        } catch (err) {
            // Mark this server as checked/failed
            const newCheckedServers = new Set(checkedServers);
            newCheckedServers.add(randomServer.name);
            setCheckedServers(newCheckedServers);

            // Try another server
            console.error(`Server ${randomServer.name} failed:`, err);
            selectRandomServer(serverList);
        }
    };

    const testServerConnection = async (server: Server): Promise<boolean> => {
        try {
            // Test the server by fetching stats or a small amount of data
            const response = await fetch(paths.getServerStats(server.name));
            return response.ok && (await response.json()).status === 'OK';
        } catch (err) {
            console.error(`Error testing connection to ${server.name}:`, err);
            return false;
        }
    };

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

    if (isLoading) {
        return <div className="p-4 text-center">Loading servers...</div>;
    }

    if (servers.length === 0) {
        return <div className="p-4 text-center">No servers available</div>;
    }

    return (
        <div className="p-4">
            <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => selectRandomServer(servers)}
            >
                Change Server
            </button>
        </div>
    );
};

export default RadioBrowserServerSelector;