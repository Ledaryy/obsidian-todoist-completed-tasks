import { Notice } from "obsidian";

export async function fetchTasks(
	authToken: string,
	timeFrames: any
): Promise<any> {
	const {
		timeStartFormattedDate,
		timeStartFormattedTime,
		timeEndFormattedDate,
		timeEndFormattedTime,
	} = timeFrames;

	try {
		const url =
			`https://api.todoist.com/sync/v8/completed/get_all?since=` +
			timeStartFormattedDate +
			`T` +
			timeStartFormattedTime +
			`&until=` +
			timeEndFormattedDate +
			`T` +
			timeEndFormattedTime +
			`&limit=200`;
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

		return parsedTodos;
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
