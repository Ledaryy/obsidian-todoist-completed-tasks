import { moment, Notice } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";
import { RawTodoistTask } from "./fetchTasks";

export interface TodoistTask {
	taskId: number;
	content: string;
	dateCompleted: Date | null;
	childTasks: TodoistTask[];
}

function prepareTasksForRendering(tasks: any) {
	let childTasks = tasks.filter(
		(task: RawTodoistTask) => task.parentId !== null
	);
	let renderedTasks: TodoistTask[] = [];

	function convertToDateObj(date: string) {
		if (date === null) {
			return null;
		}
		return new Date(date);
	}

	tasks.forEach((task: any) => {
		if (task.parentId === null) {
			renderedTasks.push({
				taskId: task.taskId,
				content: task.content,
				dateCompleted: convertToDateObj(task.dateCompleted),
				childTasks: [],
			});
		}
	});

	childTasks.forEach(async (task: any) => {
		const parentTaskIndex = renderedTasks.findIndex(
			(t: TodoistTask) => t.taskId === task.parentId
		);
		renderedTasks[parentTaskIndex].childTasks.push({
			taskId: task.taskId,
			content: task.content,
			dateCompleted: convertToDateObj(task.dateCompleted),
			childTasks: [],
		});
	});

	return renderedTasks;
}

function renderTasksAsText(tasks: any, settings: TodoistSettings) {
	console.log(tasks);

	function renderTaskFinishDate(task: any) {
		if (task.dateCompleted === null) {
			return "Not completed yet";
		}

		if (settings.taskPostfix.includes("{task_finish_date}")) {
			const formattedDate = moment(task.dateCompleted).format("YYYY-MM-DD");;
			return formattedDate;
		}

		if (settings.taskPostfix.includes("{task_finish_datetime}")) {
			const formattedDate = moment(task.dateCompleted).format("YYYY-MM-DD HH:mm");;
			return formattedDate;
		}
		
		if (settings.taskPostfix.includes("{current_date}")) {
			const formattedDate = moment(task.dateCompleted).format("YYYY-MM-DD");;
			return formattedDate;
		}
		
		if (settings.taskPostfix.includes("{current_datetime}")) {
			const formattedDate = moment(task.dateCompleted).format("YYYY-MM-DD HH:mm");;
			return formattedDate;
		}
	}

	function renderTaskPostfix(task: any) {
		let regex =
			/{task_finish_date}|{task_finish_datetime}|{current_date}|{current_datetime}/g;
		return settings.taskPostfix.replace(regex, renderTaskFinishDate(task));
	}

	function renderTaskPrefix(task: any, index: number) {
		let regex = /{auto_increment}/g;
		return settings.taskPrefix.replace(regex, `${index + 1}`);
	}

	try {
		let formattedTasks = tasks.reverse().map((t: any, index: number) => {
			let formattedParentPrefix = renderTaskPrefix(t, index);
			let formattedParentPostfix = renderTaskPostfix(t);

			let returnString = `${formattedParentPrefix} ${t.content} ${formattedParentPostfix}`;

			if (t.childTasks.length > 0) {
				const childTasks = t.childTasks
					.reverse()
					.map((childTask: any, index: number) => {
						let formattedChildPrefix = renderTaskPrefix(
							childTask,
							index
						);
						let formattedPostfix = renderTaskPostfix(childTask);

						return `    ${formattedChildPrefix} ${childTask.content} ${formattedPostfix}`;
					});
				returnString += "\n" + childTasks.join("\n");
			}
			return returnString;
		});

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

export { renderTasksAsText, prepareTasksForRendering };
