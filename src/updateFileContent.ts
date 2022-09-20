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

	new Notice("Completed tasks loaded.");
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
		const completedTasksMetadata = await fetch(url, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		}).then(function (response) {
			return response.json();
		});

		new Notice(
			completedTasksMetadata.items.length +
				" completed tasks found. Processing..."
		);

		const CompletedTasksPromises = completedTasksMetadata.items.map(
			async (task: { task_id: number }) => {
				const url = `https://api.todoist.com/sync/v8/items/get?item_id=${task.task_id}`;
				let completedTasks = await fetch(url, {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				});
				const data = await completedTasks.json();
				return data;
			}
		);

		const completedTasks = await Promise.all(CompletedTasksPromises);

		const parsedTodos = completedTasks.map((task: any) => {
			return {
				content: task.item.content,
				dateCompleted: task.item.date_completed,
				description: task.item.description,
				parentId: task.item.parent_id,
				taskId: task.item.id,
				childTasks: [],
			};
		});

		let childTasks = parsedTodos.filter(
			(task: any) => task.parentId !== null
		);

		parsedTodos.forEach((task: any) => {
			if (task.parentId !== null) {
				const parentTask = parsedTodos.find(
					(t: any) => t.taskId === task.parentId
				);
				parentTask.childTasks.push(task);
			}
		});

		childTasks.forEach((task: any) => {
			const index = parsedTodos.indexOf(task);
			parsedTodos.splice(index, 1);
		});

		const formattedTasks = parsedTodos.map((t: any, index: number) => {
			let returnString = "";

			if (taskPrefix === "$AUTOINCREMENT") {
				returnString = `${index + 1}. ${t.content}`;
			} else {
				returnString = `${taskPrefix} ${t.content}`;
			}
			if (t.childTasks.length > 0) {
				const childTasks = t.childTasks.map(
					(childTask: any, index: number) => {
						if (taskPrefix === "$AUTOINCREMENT") {
							return `    ${index + 1}. ${childTask.content}`;
						} else {
							return `    ${taskPrefix} ${childTask.content}`;
						}
					}
				);
				returnString += "\n" + childTasks.join("\n");
			}
			return returnString;
		});

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
