import { createContext } from "react"

export type FavoriteContextProps = {
	favorites: string[]
	toggleFavorite: (uuid: string) => void
	isFavorite: (uuid: string) => boolean
}

export const FavoritesContext = createContext<FavoriteContextProps | undefined>(undefined)
