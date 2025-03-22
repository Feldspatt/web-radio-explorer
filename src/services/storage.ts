export enum LocalStorageKey {
	FAVORITES = "favorites",
	LAST_LISTENED = "last_listened"
}

export function getFavoritesList(): string[] {
	return JSON.parse(window.localStorage.getItem(LocalStorageKey.FAVORITES) || "[]")
}

export function toggleFavorite(stationuuid: string) {
	const favorites = getFavoritesList()
	const index = favorites.indexOf(stationuuid)
	if (index !== -1) favorites.splice(index, 1)
	else favorites.unshift(stationuuid)

	storeFavorites(favorites)
}

export function storeFavorites(uuids: string[]) {
	window.localStorage.setItem(LocalStorageKey.FAVORITES, JSON.stringify(uuids))
}

export function getLastListenedList(): string[] {
	return JSON.parse(window.localStorage.getItem(LocalStorageKey.LAST_LISTENED) || "[]")
}

export function addLastListened(stationuuid: string) {
	const lastListened = getLastListenedList()
	lastListened.unshift(stationuuid)
	if (lastListened.length > 20) lastListened.pop()
	storeLastListened(lastListened)
}

export function storeLastListened(uuids: string[]) {
	window.localStorage.setItem(LocalStorageKey.LAST_LISTENED, JSON.stringify(uuids))
}
