import { App, Notice, } from 'obsidian'
import { TodoistSettings } from "./DefaultSettings";
import moment from 'moment';

export async function updateFileFromServer(settings: TodoistSettings, app: App) {
	const file = app.workspace.getActiveFile();
	let fileContents = await app.vault.read(file)

	if (fileContents.contains(settings.keywordSegmentStart) && fileContents.contains(settings.keywordSegmentEnd)) {
		let formattedTodos = await getServerData(settings.authToken);
		formattedTodos = `\n` + formattedTodos + `\n`;

		fileContents = await app.vault.read(file)

		let chunkForReplace = fileContents.split(settings.keywordSegmentStart)[1];
		chunkForReplace = chunkForReplace.split(settings.keywordSegmentEnd)[0];

		const newData = fileContents.replace(chunkForReplace, formattedTodos);

		await app.vault.modify(file, newData)
	} else {
		new Notice("No keyword found in file")
	}
}

async function getServerData(authToken: string): Promise<string> {

	const timeInput = moment(new Date()).format("YYYY-MM-DD")
	const currentTime = new Date()
	const timeStartUTC = new Date(Date.parse(timeInput + "T00:00:00Z"));

	const timeStartWithOffset = new Date(timeStartUTC.getTime() + (currentTime.getTimezoneOffset() * 60 * 1000));
	const timeStartFormattedDate = moment(timeStartWithOffset).format('YYYY-MM-DD');
	const timeStartFormattedTime = moment(timeStartWithOffset).format('HH:mm');

	const timeEndUTC = new Date(timeStartWithOffset.getTime() + (24 * 60 * 60 * 1000));
	const timeEndFormattedDate = moment(timeEndUTC).format('YYYY-MM-DD');
	const timeEndFormattedTime = moment(timeEndUTC).format('HH:mm');

	// console.log(timeInput)
	// console.log(timeStartFormattedDate);
	// console.log(timeStartFormattedTime);
	// console.log(timeEndFormattedDate);
	// console.log(timeEndFormattedTime);

	try {
		const url = `https://api.todoist.com/sync/v8/completed/get_all?since=` + timeStartFormattedDate + `T` + timeStartFormattedTime + `&until=` + timeEndFormattedDate + `T` + timeEndFormattedTime;
		const response = await fetch(url, {
			headers: {
				"Authorization": `Bearer ${authToken}`,
			}
		}).then(function (response) {
			return response.json()
		});
		new Notice("TCT: " + response.items.length + " completed tasks found.")

		const formattedTasks = response.items.map(t => {
			// let date = moment(t.completed_date).format('HH:mm');
			return `* ${t.content}`
			// return `* ${date}: ${t.content} -- `
		})
		// formattedTasks.reverse()
		return formattedTasks.join("\n");
	} catch (e) {
		let errorMsg: string;
		switch (e.httpStatusCode) {
			case undefined:
				errorMsg = `TCT: There was a problem pulling data from Todoist. Is your internet connection working?`
				break;
			case 403:
				errorMsg = "TCT: Authentication with todoist server failed. Check that" +
					" your API token is set correctly in the settings.";
				break;
			default:
				`TCT: There was a problem pulling data from Todoist. ${e.responseData}`;
		}
		console.log(errorMsg, e);
		new Notice(errorMsg);
		throw (e)
	}
}