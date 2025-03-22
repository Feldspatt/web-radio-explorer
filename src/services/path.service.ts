export const serversAddresses = [
	"https://de1.api.radio-browser.info",
	"https://nl1.api.radio-browser.info",
	"https://at1.api.radio-browser.info"
]

let radioServerUrl = "https://de1.api.radio-browser.info/json"

export const paths = {
	getServerStats: (ip: string) => `${ip}/json/stats`,
	setServer: (ip: string) => {
		radioServerUrl = `${ip}/json`
	},
	getCountries: () => `${radioServerUrl}/countries`,
	getLanguages: () => `${radioServerUrl}/languages`,
	getTags: () => `${radioServerUrl}/tags`,
	getVote: (uuid: string) => `${radioServerUrl}/vote/${uuid}`,
	getStationSearch: (params: URLSearchParams) => `${radioServerUrl}/stations/search?${params.toString()}`,
	getByUUID: (uuidArray: string[]) => `${radioServerUrl}/stations/byuuid?uuids=${uuidArray.join(",")}`
}

Object.freeze(paths)
