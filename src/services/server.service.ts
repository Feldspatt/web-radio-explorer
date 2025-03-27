import { paths } from "./path.service"

function ipToArpa(ipAddress: string) {
	// Split the IP address into octets
	const octets = ipAddress.split(".")

	// Reverse the order of octets and append .in-addr.arpa
	if (octets.length === 4) {
		return `${octets[3]}.${octets[2]}.${octets[1]}.${octets[0]}.in-addr.arpa`
	}

	throw new Error("Invalid IPv4 address")
}

async function fetchAvailableIPs(): Promise<string[]> {
	try {
		const dnsLookupResponse = await fetch(paths.dnsLookup())
		if (!dnsLookupResponse.ok) {
		}

		return ((await dnsLookupResponse.json()).Answer as { data: string }[]).map((record) => record.data)
	} catch (error) {
		console.error(`Failed to lookup dns: ${JSON.stringify(error)}`)
		throw error
	}
}

async function fetchIpDns(ip: string): Promise<string> {
	try {
		const dnsResponse = await fetch(paths.reverseDnsLookup(ipToArpa(ip)))
		if (!dnsResponse.ok) {
		}
		return ((await dnsResponse.json()).Answer as { data: string }[]).map((record) => record.data)[0].slice(0, -1)
	} catch (error) {
		console.error(`Failed to lookup dns: ${JSON.stringify(error)}`)
		throw error
	}
}

export async function getRandomServer(): Promise<string> {
	const ips = await fetchAvailableIPs()
	return await fetchIpDns(ips[Math.floor(Math.random() * ips.length)])
}
