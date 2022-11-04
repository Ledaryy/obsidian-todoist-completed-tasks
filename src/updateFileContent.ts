import { App, Notice, MarkdownView } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";
import { fetchTasks } from "./fetchTasks";
import { formatTasks } from "./formatTasks";
import { FETCH_STRATEGIES } from "./constants";
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
	fetchStrategy: string
) {
	const editor = app.workspace.getActiveViewOfType(MarkdownView).editor;
	const fileContent = editor.getValue();

	if (
		!settingsCheck(settings) ||
		!segmentsCheck(fileContent, settings, fetchStrategy)
	) {
		return;
	}

	let timeFrames = null;

	if (fetchStrategy === FETCH_STRATEGIES.today) {
		timeFrames = getTimeframesForUsersToday();
	}
	if (fetchStrategy === FETCH_STRATEGIES.lastNHours) {
		timeFrames = getTimeframesForLastNHours(time);
	}
	if (fetchStrategy === FETCH_STRATEGIES.fromFile) {
		timeFrames = getTimeFromKeySegments(fileContent);
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

	let rangeStart = fileContent.indexOf(settings.keywordSegmentStart);
	let rangeEnd = fileContent.indexOf(settings.keywordSegmentEnd);


	if (fetchStrategy === FETCH_STRATEGIES.fromFile) {
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
