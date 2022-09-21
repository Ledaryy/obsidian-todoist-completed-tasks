import { TodoistSettings } from "./DefaultSettings";

export function formatTasks(tasks: any, settings: TodoistSettings) {
	const taskPrefix = settings.taskPrefix;

	let childTasks = tasks.filter((task: any) => task.parentId !== null);

	tasks.forEach((task: any) => {
		if (task.parentId !== null) {
			const parentTask = tasks.find(
				(t: any) => t.taskId === task.parentId
			);
			parentTask.childTasks.push(task);
		}
	});

	childTasks.forEach((task: any) => {
		const index = tasks.indexOf(task);
		tasks.splice(index, 1);
	});

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

	return formattedTasks.join("\n");

	// TODO add try catch
}
