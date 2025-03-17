export const cut = (str: string, n: number): string => {
	// Handle edge cases
	if (n <= 0) return ""
	if (n >= str.length) return str

	// Use substring to get the first n characters
	return str.substring(0, n) + "..."
}
