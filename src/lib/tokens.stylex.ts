import * as sx from '@stylexjs/stylex';

export const colors = sx.defineVars({
	red1: 'lch(40% 60 25)', // deep red
	red2: 'lch(55% 65 25)', // medium red
	red3: 'lch(80% 30 25)', // light red
	red4: 'lch(95% 10 25)', // very light red

	blue1: 'lch(40% 30 230)', // deep blue
	blue2: 'lch(55% 40 230)', // medium blue
	blue3: 'lch(75% 30 230)', // light blue
	blue4: 'lch(90% 15 230)', // very light blue

	green1: 'lch(40% 50 140)', // deep green
	green2: 'lch(55% 55 140)', // medium green
	green3: 'lch(80% 25 140)', // light green
	green4: 'lch(95% 10 140)', // very light green

	dark1: 'lch(20% 0 0)', // very dark gray, almost black
	dark2: 'lch(40% 0 0)', // dark gray
	dark3: 'lch(60% 0 0)', // medium gray
	dark4: 'lch(80% 0 0)', // light gray

	light1: 'lch(85% 0 0)', // very light gray
	light2: 'lch(90% 0 0)', // lighter gray
	light3: 'lch(95% 0 0)', // very light gray, almost white
	light4: 'lch(100% 0 0)', // pure white
});

export const fonts = sx.defineVars({
	default: '16px',
	h1: '2rem',
	h2: '1.5rem',
	h3: '1.25rem',
});

export const spacing = sx.defineVars({
	sm: '0.25rem',
	md: '0.5rem',
	lg: '1rem',
	xl: '1.5rem',
	xx: '2rem',
});
