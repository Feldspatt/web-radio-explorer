// Helper function to convert HTTP URLs to HTTPS
export const convertHttpToHttps = (stations: RadioStation[]): RadioStation[] => {
	return stations.map((station) => {
		if (station.url?.startsWith("http:")) {
			return {
				...station,
				url: station.url.replace("http:", "https:")
			}
		}
		return station
	})
}
