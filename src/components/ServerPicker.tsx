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
			{isLoading && (
				<>
					<object type='image/svg+xml' data={`${import.meta.env.BASE_URL}splash_art.svg`} className='w-full'>
						Your browser does not support SVG
					</object>
					<h4>Connecting to radio servers...</h4>
				</>
			)}

			{errorMessage && <h4>Warning: {errorMessage}</h4>}
		</div>
	)
}

export default RadioBrowserServerSelector
