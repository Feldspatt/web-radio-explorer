export const domainName = "all.api.radio-browser.info"

let radioServerUrl = ""

export const paths = {
	getServerStats: (ip: string) => `${ip}/json/stats`,
	setServer: (ip: string) => {
		radioServerUrl = `https://${ip}/json`
		console.log(`server url updated: ${radioServerUrl}`)
	},
	getCountries: () => `${radioServerUrl}/countries`,
	getLanguages: () => `${radioServerUrl}/languages`,
	getTags: () => `${radioServerUrl}/tags`,
	sendVote: (uuid: string) => `${radioServerUrl}/vote/${uuid}`,
	getStationSearch: (params: URLSearchParams) => `${radioServerUrl}/stations/search?${params.toString()}`,
	getStationsByUUID: (uuidArray: string[]) => `${radioServerUrl}/stations/byuuid?uuids=${uuidArray.join(",")}`,
	dnsLookup: () => `https://dns.google/resolve?name=${domainName}`,
	reverseDnsLookup: (arpaAddr: string) => `https://dns.google/resolve?name=${arpaAddr}&type=PTR`
}

Object.freeze(paths)
