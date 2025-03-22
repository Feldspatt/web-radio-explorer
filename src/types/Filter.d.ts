type Filter = {
	name: string
	country: string
	tag: string
	language: string
	offset: string
	limit: string
	reverse: "true" | "false"
	order: Order
}

type Order = "clickcount" | "votes" | "name"
