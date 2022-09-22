import { moment } from "obsidian";

function getTimeframesForUsersToday(): any {
	let currentTime = new Date();
	currentTime.setHours(0, 0, 0, 0);

	const taskStartInServerTime =
		currentTime.getTime() + currentTime.getTimezoneOffset() * 60 * 1000;
	const timeStartFormattedDate = moment(taskStartInServerTime).format(
		"YYYY-MM-DD"
	);
	const timeStartFormattedTime = moment(taskStartInServerTime).format(
		"HH:mm"
	);

	const taskEndInServerTime =
		currentTime.getTime() +
		currentTime.getTimezoneOffset() * 60 * 1000 +
		24 * 60 * 60 * 1000;
	const timeEndFormattedDate =
		moment(taskEndInServerTime).format("YYYY-MM-DD");
	const timeEndFormattedTime = moment(taskEndInServerTime).format("HH:mm");

	return {
		timeStartFormattedDate,
		timeStartFormattedTime,
		timeEndFormattedDate,
		timeEndFormattedTime,
	};
}

function getTimeframesForLastNHours(hours: number) {
	let currentTime = new Date();

	const taskStartInServerTime =
		currentTime.getTime() +
		currentTime.getTimezoneOffset() * 60 * 1000 -
		hours * 60 * 60 * 1000;
	const timeStartFormattedDate = moment(taskStartInServerTime).format(
		"YYYY-MM-DD"
	);
	const timeStartFormattedTime = moment(taskStartInServerTime).format(
		"HH:mm"
	);

	const taskEndInServerTime =
		currentTime.getTime() + currentTime.getTimezoneOffset() * 60 * 1000;
	const timeEndFormattedDate =
		moment(taskEndInServerTime).format("YYYY-MM-DD");
	const timeEndFormattedTime = moment(taskEndInServerTime).format("HH:mm");

	return {
		timeStartFormattedDate,
		timeStartFormattedTime,
		timeEndFormattedDate,
		timeEndFormattedTime,
	};
}

function getTimeframesForLastNHoursWithoutOffset(hours: number) {
	let currentTime = new Date();

	const taskStartInServerTime =
		currentTime.getTime() - hours * 60 * 60 * 1000;
	const timeStartFormattedDate = moment(taskStartInServerTime).format(
		"YYYY-MM-DD"
	);
	const timeStartFormattedTime = moment(taskStartInServerTime).format(
		"HH:mm"
	);

	const taskEndInServerTime = currentTime.getTime();
	const timeEndFormattedDate =
		moment(taskEndInServerTime).format("YYYY-MM-DD");
	const timeEndFormattedTime = moment(taskEndInServerTime).format("HH:mm");

	return {
		timeStartFormattedDate,
		timeStartFormattedTime,
		timeEndFormattedDate,
		timeEndFormattedTime,
	};
}

export {
	getTimeframesForUsersToday,
	getTimeframesForLastNHours,
	getTimeframesForLastNHoursWithoutOffset,
};
