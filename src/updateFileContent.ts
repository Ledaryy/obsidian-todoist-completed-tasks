import { App, Notice, MarkdownView } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";
import { fetchTasks } from "./fetchTasks";
import { formatTasks } from "./formatTasks";
import {
	getTimeframesForUsersToday,
	getTimeframesForLastNHours,
	getTimeFromKeySegments,
	settingsCheck,
	segmentsCheck,
} from "./utils";

export async function updateFileFromServer(
	settings: TodoistSettings,
	app: App,
	time: number,
	useTimeFromKeySegment: boolean
) {
	const editor = app.workspace.getActiveViewOfType(MarkdownView).editor;
	const fileContent = editor.getValue();

	if (
		!settingsCheck(settings) ||
		!segmentsCheck(fileContent, settings, useTimeFromKeySegment)
	) {
		return;
	}

	let timeFrames = null;

	if (useTimeFromKeySegment) {
		timeFrames = getTimeFromKeySegments(fileContent);
	} else if (time === 0) {
		timeFrames = getTimeframesForUsersToday();
	} else if (time > 0) {
		timeFrames = getTimeframesForLastNHours(time);
	}

	if (timeFrames === null) {
		new Notice("Invalid time frame.", 10000);
		return;
	}

	const rawTasks = await fetchTasks(
		settings.authToken,
		timeFrames,
		settings.renderSubtasks
	);

	if (rawTasks.length === 0) {
		return;
	}

	let formattedTasks = formatTasks(rawTasks, settings);

	formattedTasks = `\n` + formattedTasks + `\n`;

	let rangeStart = fileContent.indexOf(settings.keywordSegmentStart);
	let rangeEnd = fileContent.indexOf(settings.keywordSegmentEnd);

	if (useTimeFromKeySegment) {
		rangeStart = fileContent.indexOf(timeFrames.startString);
		rangeEnd = fileContent.indexOf(timeFrames.endString);
		formattedTasks = `${timeFrames.startString}${formattedTasks}`;
	} else {
		formattedTasks = `${settings.keywordSegmentStart}${formattedTasks}`;
	}

	editor.replaceRange(
		formattedTasks,
		editor.offsetToPos(rangeStart),
		editor.offsetToPos(rangeEnd)
	);

	new Notice("Completed tasks loaded.");
}
