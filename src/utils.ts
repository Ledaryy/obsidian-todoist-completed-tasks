import { moment, Notice } from "obsidian";
import { CONSTANTS_SEGMENTS, CONSTANTS_REGEX } from "./constants";

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

function getTimeFromKeySegments(fileContent: string) {
	const startString = fileContent.match(CONSTANTS_REGEX.regexStartCompiled);
	const endString = fileContent.match(CONSTANTS_REGEX.regexEndCompiled);

	let datetimeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/;
	const startDateString = startString[0].match(datetimeRegex);
	const endDateString = endString[0].match(datetimeRegex);

	let currentTimeObj = new Date();
	let startTimeObj = new Date(startDateString[0]);
	let endTimeObj = new Date(endDateString[0]);

	const taskStartInServerTime =
		startTimeObj.getTime() + currentTimeObj.getTimezoneOffset() * 60 * 1000;
	const timeStartFormattedDate = moment(taskStartInServerTime).format(
		"YYYY-MM-DD"
	);
	const timeStartFormattedTime = moment(taskStartInServerTime).format(
		"HH:mm"
	);

	const taskEndInServerTime =
		endTimeObj.getTime() + currentTimeObj.getTimezoneOffset() * 60 * 1000;
	const timeEndFormattedDate =
		moment(taskEndInServerTime).format("YYYY-MM-DD");
	const timeEndFormattedTime = moment(taskEndInServerTime).format("HH:mm");

	if (
		timeStartFormattedDate === "Invalid date" ||
		timeEndFormattedDate === "Invalid date"
	) {
		return null;
	}

	return {
		timeStartFormattedDate,
		timeStartFormattedTime,
		timeEndFormattedDate,
		timeEndFormattedTime,
		startString,
		endString,
	};
}

function settingsCheck(settings: any) {
	if (
		settings.keywordSegmentStart === "" ||
		settings.keywordSegmentEnd === ""
	) {
		new Notice(
			"No keyword segment set. Please set one in the settings.",
			10000
		);
		return false;
	}
	if (settings.authToken === "") {
		new Notice("No auth token set. Please set one in the settings.", 10000);
		return false;
	}
	return true;
}

function segmentsCheck(
	fileContent: string,
	settings: any,
	useTimeFromKeySegment: boolean
) {
	if (useTimeFromKeySegment) {
		const startString = fileContent.match(
			CONSTANTS_REGEX.regexStartCompiled
		);
		const endString = fileContent.match(CONSTANTS_REGEX.regexEndCompiled);

		if (startString === null || endString === null) {
			new Notice(
				`Keyword segment not found in current file. You are using templated segments. ` +
					`\nPlease follow this format: \n${CONSTANTS_SEGMENTS.templatedSegmentStart} \n${CONSTANTS_SEGMENTS.templatedSegmentEnd}`,
				10000
			);
			return false;
		}
	} else if (
		!fileContent.includes(settings.keywordSegmentStart) ||
		!fileContent.includes(settings.keywordSegmentEnd)
	) {
		new Notice(
			`Keyword segment not found in current file. ` +
				`Please add: \n'${settings.keywordSegmentStart}' \nand \n'${settings.keywordSegmentEnd}' \nto the file.`,
			10000
		);
		return false;
	}

	return true;
}

export {
	getTimeframesForUsersToday,
	getTimeframesForLastNHours,
	getTimeframesForLastNHoursWithoutOffset,
	getTimeFromKeySegments,
	settingsCheck,
	segmentsCheck,
};
