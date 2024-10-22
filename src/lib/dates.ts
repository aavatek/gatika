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

export enum Weekdays {
	SUN = 0,
	MON = 1,
	TUE = 2,
	WED = 3,
	THU = 4,
	FRI = 5,
	SAT = 6,
}

export enum Months {
	January = 0,
	February = 1,
	March = 2,
	April = 3,
	May = 4,
	June = 5,
	July = 6,
	August = 7,
	September = 8,
	October = 9,
	November = 10,
	December = 11,
}
