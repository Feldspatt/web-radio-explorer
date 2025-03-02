const webRadioUrl = 'http://all.api.rdio-browser.info'

type ListSearchParams = {
    order: 'stationcount' | 'name',
    hidebroken: 'true' | 'false',
    limit: string,
    reverse: 'true' | 'false',
    offset: string,
}

type StationSearchParams = {
    hidebroken: 'true' | 'false',
    limit: string,
    offset: string,
}

enum ListResource {
    TAGS= "TAGS",
    STATIONS = "STATIONS",
    LANGUAGES = "LANGUAGES",
}

enum StationResource {
    TOPCLICK = "topclick",
    LASTCLICK = "lastclick",
    LASTCHANGE = "lastchange",
}

export async function fetchList(resource: ListResource, searchParams: ListSearchParams) {
    const params = new URLSearchParams(searchParams)
    const url = `${webRadioUrl}/json/${resource}?${params}`

    try {
        const response = await fetch(url)
        if(response.ok) return response.json()
    } catch (error) {
        console.error(`Error fetching web radio list! url: ${webRadioUrl}/json/${resource}?${params}`)
        throw error
    }
}

export async function fetchStations(resource: StationResource, searchParams: StationSearchParams) {
    const params = new URLSearchParams(searchParams)
    const url = `${webRadioUrl}/json/${resource}?${params}`

    try {
        const response = await fetch(url)
        if(response.ok) return response.json()
    } catch (error) {
        console.error(`Error fetching web radio list! url: ${webRadioUrl}/json/${resource}?${params}`)
        throw error
    }
}