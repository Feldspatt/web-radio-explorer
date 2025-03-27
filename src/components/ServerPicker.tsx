import { useState, useEffect } from "react"
import { paths } from "../services/path.service.ts"
import { getRandomServer } from "../services/server.service.ts"
import "../style/ServerPicker.css"

type ServerpickerProp = {
	onServerLoaded?: () => void
}

const RadioBrowserServerSelector = ({ onServerLoaded }: ServerpickerProp) => {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	useEffect(() => {
		setIsLoading(true)
		const tryServers = async () => {
			try {
				const server = await getRandomServer()
				console.info(`server selected: ${server}`)
				paths.setServer(server)
				onServerLoaded?.()
			} catch (error) {
				console.error(`error selecting a valid server: ${error}`)
				setErrorMessage("Failed to find a valid server!")
			}
		}

		tryServers().then(() => setIsLoading(false))
	}, [onServerLoaded])

	// Show splash art in all other cases (loading, success)
	return (
		<div className='server-picker'>
			<object type='image/svg+xml' data={`${import.meta.env.BASE_URL}splash_art.svg`} className='w-full'>
				Your browser does not support SVG
			</object>

			{isLoading && (
				<div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-75 px-3 py-1 rounded'>
					Connecting to radio servers...
				</div>
			)}

			{errorMessage && (
				<div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-75 px-3 py-1 rounded text-yellow-700'>
					Warning: {errorMessage}
				</div>
			)}
		</div>
	)
}

export default RadioBrowserServerSelector
