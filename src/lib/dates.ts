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

export const getStartOfWeek = (date: number): number => {
	const daysSinceEpoch = Math.floor(date / DAY);
	const weekday = (daysSinceEpoch + 4) % 7;
	const daysToSubtract = weekday;
	return date - daysToSubtract * DAY;
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
