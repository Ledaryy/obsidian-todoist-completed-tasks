import { App, Notice, MarkdownView } from "obsidian";
import { TodoistSettings } from "./defaultSettings";
import { fetchTasks } from "./fetchTasks";
import { formatTasks } from "./formatTasks";
import {
	getTimeframesForUsersToday,
	getTimeframesForLastNHours,
} from "./utils";

export async function updateFileFromServer(
	settings: TodoistSettings,
	app: App,
	time: number
) {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	const editor = view.editor;

	if (settings.authToken === "") {
		new Notice("No auth token set. Please set one in the settings.");
		return;
	}

	if (
		settings.keywordSegmentStart === "" ||
		settings.keywordSegmentEnd === ""
	) {
		new Notice("No keyword segment set. Please set one in the settings.");
		return;
	}

	let fileContent = editor.getValue();
	if (
		!fileContent.contains(settings.keywordSegmentStart) ||
		!fileContent.contains(settings.keywordSegmentEnd)
	) {
		new Notice(
			`Keyword segment not found in current file. Please add '${settings.keywordSegmentStart}' and '${settings.keywordSegmentEnd}' to the file.`
		);
		return;
	}

	let timeFrames = {};

	if (time === 0) {
		timeFrames = getTimeframesForUsersToday();
	} else if (time > 0) {
		timeFrames = getTimeframesForLastNHours(time);
	} else {
		new Notice("Invalid time frame.");
		return;
	}

	const rawTasks = await fetchTasks(
		settings.authToken,
		timeFrames,
		settings.renderSubtasks
	);

	let formattedTasks = formatTasks(rawTasks, settings);

	formattedTasks = `\n` + formattedTasks + `\n`;
	formattedTasks = `${settings.keywordSegmentStart}${formattedTasks}`;

	const rangeStart = fileContent.indexOf(settings.keywordSegmentStart);
	const rangeEnd = fileContent.indexOf(settings.keywordSegmentEnd);

	editor.replaceRange(
		formattedTasks,
		editor.offsetToPos(rangeStart),
		editor.offsetToPos(rangeEnd)
	);

	new Notice("Completed tasks loaded.");
}
