import { serversAddresses, paths } from "./path.service"

export async function selectAServer(): Promise<Server> {
	const server = await Promise.any(serversAddresses.map(async (server) => testServer(server)))
	if (server === null) throw new Error("an error occured while looking for a valid server")
	return server
}

async function testServer(serverUrl: string): Promise<Server | null> {
	const response = await fetch(paths.getServerStats(serverUrl))
	if (!response.ok) {
		throw new Error(`Failed to fetch server ${serverUrl} stats: ${response.status}`)
	}

	const stats: Stats = await response.json()

	if (stats.status !== "OK") {
		throw new Error(`Server is not ok: ${stats.status}`)
	}

	return {
		name: serverUrl,
		stations: stats.stations - stats.stations_broken
	}
}
