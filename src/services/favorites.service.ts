export function getFavorites() {
    const favorites = window.localStorage.getItem('favorites')
    if(!favorites) return []
    else return JSON.parse(favorites)
}

export function setFavorites(favorites: string[]) {
    window.localStorage.setItem('favorites', JSON.stringify(favorites))
}
