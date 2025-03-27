import { useState, useEffect } from "react"
import { selectAServer } from "../services/server.service.ts"

interface RadioBrowserServerSelectorProps {
	onServerSelected: (server: Server) => void
}

interface Server {
	name: string
	stations: number
}

const RadioBrowserServerSelector = ({ onServerSelected }: RadioBrowserServerSelectorProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	useEffect(() => {
		setIsLoading(true)
		const tryServers = async () => {
			try {
				const server = await selectAServer()
				console.info(`server selected: ${server.name}`)
				onServerSelected(server)
			} catch (error) {
				console.error(`error selectinng a valid server: ${JSON.stringify(error)}`)
				setErrorMessage("Failed to find a valid server!")
			}
		}

		tryServers().then(() => setIsLoading(false))
	}, [onServerSelected])

	// Show splash art in all other cases (loading, success)
	return (
		<div className='relative'>
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
