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
			`Keyword segment not found in current file. Please add '${settings.keywordSegmentStart}' and '${settings.keywordSegmentEnd}' to the file.`
		);
		return;
	}

	let formattedTodos = await getServerData(
		settings.authToken,
		settings.taskPrefix
	);

	formattedTodos = `\n` + formattedTodos + `\n`;
	formattedTodos = `${settings.keywordSegmentStart}${formattedTodos}`;

	const rangeStart = fileContent.indexOf(settings.keywordSegmentStart);
	const rangeEnd = fileContent.indexOf(settings.keywordSegmentEnd);

	editor.replaceRange(
		formattedTodos,
		editor.offsetToPos(rangeStart),
		editor.offsetToPos(rangeEnd)
	);
}

async function getServerData(
	authToken: string,
	taskPrefix: string
): Promise<string> {
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
		const formattedTasks = response.items
			.reverse()
			.map((t: { content: any }, index: number) => {
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
