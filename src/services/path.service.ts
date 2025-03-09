const infoUrl = 'http://all.api.radio-browser.info/json'
export const defaultServerUrl = 'de1.api.radio-browser.info'
let radioServerUrl = 'https://de1.api.radio-browser.info/json'

export const paths = {
    getServers: ()=> infoUrl + '/servers',
    getServerStats: (ip: string)=> 'https://' + ipvFormatter(ip) + '/json/stats',
    setServer: (ip: string)=> radioServerUrl = 'https://' + ipvFormatter(ip) + '/json',
    getCountries: () => radioServerUrl + '/countries',
    getLanguages: () => radioServerUrl + '/languages',
    getTags: () => radioServerUrl + '/tags',
    getVote: (uuid: string) => radioServerUrl + `/vote/${uuid}`,
    getStationSearch: (params: URLSearchParams)=> radioServerUrl + `/stations/search?${params.toString()}`,
    getByUUID: (uuidArray: string[]) => radioServerUrl + `/stations/byuuid?uuids=${uuidArray.join(',')}`,
}

function ipvFormatter(ip: string) {
    if(ip.indexOf(':') > -1) return `[${ip}]`
    else return ip
}

Object.freeze(paths)