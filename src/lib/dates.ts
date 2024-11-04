const SECOND = 1000;
const MINUTE = 60000;
const HOUR = 3600000;
const DAY = 86400000;
const WEEK = 604800000;
const MONTH = 2592000000;
const YEAR = 31536000000;

export { SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR };

export const formatTime = (epoch: number) => {
	const date = new Date(epoch);

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	return `${day}.${month}.${year}`;
};

export const getWeekStart = (date: number): number => {
	const daysSinceEpoch = Math.floor(date / DAY);
	const weekday = (daysSinceEpoch + 4) % 7;
	const daysToSubtract = weekday;
	return date - daysToSubtract * DAY;
};

export const getWeekNumber = (d: Date): number => {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const getNormalizedTime = (epoch: number): number => {
	const dateObj = new Date(epoch);
	dateObj.setUTCHours(0, 0, 0, 0);
	return dateObj.getTime();
};

export enum Weekdays {
	SU = 0,
	MA = 1,
	TI = 2,
	KE = 3,
	TO = 4,
	PE = 5,
	LA = 6,
}

export enum Months {
	Tammikuu = 0,
	Helmikuu = 1,
	Maaliskuu = 2,
	Huhtikuu = 3,
	Toukokuu = 4,
	Kesäkuu = 5,
	Heinäkuu = 6,
	Elokuu = 7,
	Syyskuu = 8,
	Lokakuu = 9,
	Marraskuu = 10,
	Joulukuu = 11,
}
