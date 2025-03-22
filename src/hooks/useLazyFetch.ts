import { useState, useCallback } from "react"

type FetchInput = { url: string; options: RequestInit }
type FetchState<T> = { data: T | null; loading: boolean; error: string | null }

const useLazyFetch = <T>({ url, options }: FetchInput): [(input: FetchInput) => Promise<T>, FetchState<T>] => {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	// The fetch function that will be called manually
	const executeFetch = useCallback(
		async (overrideUrl = null, overrideOptions: RequestInit = {}): Promise<T | null> => {
			// Reset error state and set loading to true
			setError(null)
			setLoading(true)

			// Use override values or defaults
			const fetchUrl = overrideUrl || url
			const fetchOptions = { ...options, ...overrideOptions }

			try {
				const response = await fetch(fetchUrl, fetchOptions)

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const result = await response.json()
				setData(result)
				return result // Return data for immediate use if needed
			} catch (err) {
				const errorMessage = (err as Error)?.message || "Something went wrong"
				setError(errorMessage)
				return null
			} finally {
				setLoading(false)
			}
		},
		[url, options]
	)

	return [executeFetch, { data, loading, error }]
}

export default useLazyFetch
