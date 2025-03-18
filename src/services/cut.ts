export const cut = (str: string, n: number): string => {
	if (n <= 2) return ""
	if (n >= str.length) return str
	return `${str.substring(0, n - 2)}...`
}
