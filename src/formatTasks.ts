import { Notice } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";

export function formatTasks(tasks: any, settings: TodoistSettings) {
	try {
		const taskPrefix = settings.taskPrefix;
		const taskPostfix = settings.taskPostfix;

		let childTasks = tasks.filter((task: any) => task.parentId !== null);
		let makeSubtaskErrorNotice = false;

		if (childTasks.length > 0) {
			tasks.forEach((task: any) => {
				if (task.parentId !== null) {
					const parentTask = tasks.find(
						(t: any) => t.taskId === task.parentId
					);
					if (parentTask) {
						parentTask.childTasks.push(task);
					} else {
						console.log("Parent task not found for: ", task);
						makeSubtaskErrorNotice = true;
					}
				}
			});

			childTasks.forEach((task: any) => {
				const index = tasks.indexOf(task);
				tasks.splice(index, 1);
			});
		}

		let formattedPostfix = taskPostfix;

		if (taskPostfix.includes("$DATE")) {
			const date = new Date();
			const day = date.getDate();
			const month = date.getMonth() + 1;
			const year = date.getFullYear();
			const formattedDate = `${day}-${month}-${year}`;
			formattedPostfix = taskPostfix.replace("$DATE", formattedDate);
		}

		let formattedTasks = tasks.reverse().map((t: any, index: number) => {
			let formattedParentPrefix = taskPrefix;
			if (taskPrefix.includes("$AUTOINCREMENT")) {
				formattedParentPrefix = formattedParentPrefix.replace(
					"$AUTOINCREMENT",
					`${index + 1}`
				);
			}
			let returnString = `${formattedParentPrefix} ${t.content} ${formattedPostfix}`;

			if (t.childTasks.length > 0) {
				const childTasks = t.childTasks
					.reverse()
					.map((childTask: any, index: number) => {
						let formattedChildPrefix = taskPrefix;
						if (formattedChildPrefix.includes("$AUTOINCREMENT")) {
							formattedChildPrefix = formattedChildPrefix.replace(
								"$AUTOINCREMENT",
								`${index + 1}`
							);
						}
						return `    ${formattedChildPrefix} ${childTask.content} ${formattedPostfix}`;
					});
				returnString += "\n" + childTasks.join("\n");
			}
			return returnString;
		});

		if (makeSubtaskErrorNotice) {
			new Notice(
				"Some subtasks were not rendered because parent tasks were not found." +
					"\nPlease check the console for more information.",
				10000
			);
			console.log(
				"Please note that to render completed subtasks, the parent task must also be completed."
			);
			console.log("The following subtasks were not rendered:");
			console.log(childTasks);
		}
		formattedTasks = formattedTasks.join("\n");
		formattedTasks = `\n` + formattedTasks + `\n`;
		return formattedTasks;
	} catch (error) {
		console.log(error);
		new Notice(
			"There was a problem formatting your tasks. Check the console for more details.",
			10000
		);
		return "";
	}
}
