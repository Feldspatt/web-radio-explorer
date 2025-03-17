import "../style/SvgSpinner.css"

export const SvgSpinner = () => (
	<svg className='svg-spinner' width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<title>spinner</title>
		<circle cx='25' cy='25' r='20' stroke='currentColor' stroke-width='5' fill='none' opacity='0.3' />
		<path d='M25 5 A20 20 0 0 1 45 25' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round' />
	</svg>
)
