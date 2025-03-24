import { useMemo } from "react"
import { type ReactNode, useEffect, useState } from "react"
import { FavoritesContext } from "../contexts/FavoritesContext"

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
	const [favorites, setFavorites] = useState<string[]>([])

	useEffect(() => {
		const storedFavorites = localStorage.getItem("favorites")
		if (storedFavorites) {
			try {
				setFavorites(JSON.parse(storedFavorites))
			} catch (error) {
				console.error("Error parsing favorites from localStorage:", error)
				setFavorites([])
			}
		}
	}, [])

	const value = useMemo(
		() => ({
			favorites,
			toggleFavorite: (uuid: string) => {
				setFavorites((prevFavorites) => {
					let newFavorites: string[]
					if (prevFavorites.includes(uuid)) newFavorites = prevFavorites.filter((id) => id !== uuid)
					else newFavorites = [...prevFavorites, uuid]

					localStorage.setItem("favorites", JSON.stringify(newFavorites))
					return newFavorites
				})
			},
			isFavorite: (uuid: string) => {
				return favorites.includes(uuid)
			}
		}),
		[favorites]
	)

	return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
