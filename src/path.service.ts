const radioServerUrl = 'https://de1.api.radio-browser.info/json'

export const paths = {
    getCountries: () => radioServerUrl + '/countries',
    getLanguages: () => radioServerUrl + '/languages',
    getTags: () => radioServerUrl + '/tags',
    getVote: (uuid: string) => radioServerUrl + `/vote/${uuid}`,
    getByUUID: (uuidArray: string[]) => radioServerUrl + `/stations/byuuid?uuids=${uuidArray.join(',')}`,
}

Object.freeze(paths)