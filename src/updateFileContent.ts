import { App, Notice, moment, MarkdownView } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";

export async function updateFileFromServer(
	settings: TodoistSettings,
	app: App
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
			"Keyword segment not found in current file. Please set one in the settings."
		);
		return;
	}

	let formattedTodos = await getServerData(settings.authToken, settings.taskPrefix);
	formattedTodos = `\n` + formattedTodos + `\n`;

	let chunkForReplace = fileContent.split(settings.keywordSegmentStart)[1];
	chunkForReplace = chunkForReplace.split(settings.keywordSegmentEnd)[0];

	chunkForReplace = `${settings.keywordSegmentStart}${chunkForReplace}${settings.keywordSegmentEnd}`;
	formattedTodos = `${settings.keywordSegmentStart}${formattedTodos}${settings.keywordSegmentEnd}`;

	const completedFile = fileContent.replace(chunkForReplace, formattedTodos);

	editor.setValue(completedFile);
}

async function getServerData(authToken: string, taskPrefix: string): Promise<string> {
	const timeInput = moment(new Date()).format("YYYY-MM-DD");
	const currentTime = new Date();
	const timeStartUTC = new Date(Date.parse(timeInput + "T00:00:00Z"));

	const timeStartWithOffset = new Date(
		timeStartUTC.getTime() + currentTime.getTimezoneOffset() * 60 * 1000
	);
	const timeStartFormattedDate =
		moment(timeStartWithOffset).format("YYYY-MM-DD");
	const timeStartFormattedTime = moment(timeStartWithOffset).format("HH:mm");

	const timeEndUTC = new Date(
		timeStartWithOffset.getTime() + 24 * 60 * 60 * 1000
	);
	const timeEndFormattedDate = moment(timeEndUTC).format("YYYY-MM-DD");
	const timeEndFormattedTime = moment(timeEndUTC).format("HH:mm");

	// console.log(timeInput)
	// console.log(timeStartFormattedDate);
	// console.log(timeStartFormattedTime);
	// console.log(timeEndFormattedDate);
	// console.log(timeEndFormattedTime);

	try {
		const url =
			`https://api.todoist.com/sync/v8/completed/get_all?since=` +
			timeStartFormattedDate +
			`T` +
			timeStartFormattedTime +
			`&until=` +
			timeEndFormattedDate +
			`T` +
			timeEndFormattedTime;
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		}).then(function (response) {
			return response.json();
		});
		new Notice(response.items.length + " completed tasks found.");
		
		const formattedTasks = response.items.reverse().map((t: { content: any }, index: number) => {
			// let date = moment(t.completed_date).format('HH:mm');
			if (taskPrefix === "$AUTOINCREMENT") {
				return `${index + 1}. ${t.content}`;
			} else {
			return `${taskPrefix} ${t.content}`;
			}
			// return `* ${date}: ${t.content} -- `
		});
		// formattedTasks.reverse();
		return formattedTasks.join("\n");
	} catch (e) {
		let errorMsg = "";
		switch (e.httpStatusCode) {
			case undefined:
				errorMsg = `There was a problem pulling data from Todoist. Is your internet connection working?`;
				break;
			case 403:
				errorMsg =
					"Authentication with todoist server failed. Check that" +
					" your API token is set correctly in the settings.";
				break;
			default:
				`There was a problem pulling data from Todoist. ${e.responseData}`;
		}
		console.log(errorMsg, e);
		new Notice(errorMsg);
		throw e;
	}
}
