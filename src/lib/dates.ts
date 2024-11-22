// time unit constants in ms
export const SECOND = 1000;
export const MINUTE = 60000;
export const HOUR = 3600000;
export const DAY = 86400000;
export const WEEK = 604800000;
export const MONTH = 2592000000;
export const YEAR = 31536000000;

/** Sets unix timestamp (ms) to UTC noon */
export const normalizeDate = (timestamp: number): number => {
	return new Date(timestamp).setUTCHours(12, 0, 0, 0);
};

/** Returns the difference between two timestamps */
export const getDateDiff = (start: number, end: number) => {
	return Math.abs((end - start) / DAY) + 1;
};

/** Returns human readable datestring */
export const formatDate = (timestamp: number) => {
	if (!Number.isFinite(timestamp)) return '';

	const date = new Date(timestamp);

	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();

	return `${day}.${month}.${year}`;
};

/** Returns the month from timestamp using UTC */
export const getMonth = (timestamp: number) =>
	new Date(timestamp).getUTCMonth();

/** Returns the week from timestamp using UTC */
export const getWeek = (timestamp: number) => {
	const date = new Date(timestamp);
	date.setUTCHours(0, 0, 0, 0);
	date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil(((date.getTime() - yearStart.getTime()) / DAY + 1) / 7);
};

export const formatTime = (timestamp: number) => {
	const date = new Date(timestamp);

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	return `${day}.${month}.${year}`;
};

export const getWeekStart = (timestamp: number): number => {
	const daysSinceEpoch = Math.floor(timestamp / DAY);
	const weekday = (daysSinceEpoch + 4) % 7;
	const daysToSubtract = weekday;
	return timestamp - daysToSubtract * DAY;
};

export const getWeekNumber = (d: Date): number => {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const normalizeTime = (epoch: number): number => {
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
