import { Notice } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";

export function formatTasks(tasks: any, settings: TodoistSettings) {
	try {
		const taskPrefix = settings.taskPrefix;

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

		const formattedTasks = tasks.reverse().map((t: any, index: number) => {
			let returnString = "";

			if (taskPrefix === "$AUTOINCREMENT") {
				returnString = `${index + 1}. ${t.content}`;
			} else {
				returnString = `${taskPrefix} ${t.content}`;
			}
			if (t.childTasks.length > 0) {
				const childTasks = t.childTasks
					.reverse()
					.map((childTask: any, index: number) => {
						if (taskPrefix === "$AUTOINCREMENT") {
							return `    ${index + 1}. ${childTask.content}`;
						} else {
							return `    ${taskPrefix} ${childTask.content}`;
						}
					});
				returnString += "\n" + childTasks.join("\n");
			}
			return returnString;
		});

		if (makeSubtaskErrorNotice) {
			new Notice(
				"Some subtasks were not rendered because parent tasks were not found." +
					"\nPlease check the console for more information." +
					"\nMessage will be removed after 10 sec.",
				10000
			);
			console.log(
				"Please note that to render completed subtasks, the parent task must also be completed."
			);
		}

		return formattedTasks.join("\n");
	} catch (error) {
		console.log(error);
		new Notice(
			"There was a problem formatting your tasks. Check the console for more details.",
			10000
		);
		return "";
	}
}
