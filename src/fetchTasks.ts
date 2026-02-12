import { Notice } from "obsidian";

export interface TodoistApiTask {
    readonly id: string;
    readonly task_id: string;
    readonly user_id: string;
    readonly project_id: string;
    readonly section_id: string | null;
    readonly parent_id: string | null;
    readonly added_by_uid: string | null;
    readonly assigned_by_uid: string | null;
    readonly responsible_uid: string | null;
    readonly labels: string[];
    readonly deadline: Record<string, unknown> | null;
    readonly duration: Record<string, unknown> | null;
    readonly checked: boolean;
    readonly is_deleted: boolean;
    readonly added_at: string;
    readonly completed_at: string | null;
    readonly completed_by_uid: string | null;
    readonly updated_at: string;
    readonly due: Record<string, unknown> | null;
    readonly priority: number;
    readonly child_order: number;
    readonly content: string;
    readonly description: string;
    readonly note_count: number;
    readonly day_order: number;
    readonly is_collapsed: boolean;
}

export interface RawTodoistTask {
    readonly taskId: string;
    readonly parentId: string | null;
    readonly content: string;
    readonly dateCompleted: string | null;
    readonly dateCreated: string | null;
    readonly projectId: string;
}

function generateRawTodoistTask(
    task: TodoistApiTask,
    isSubtaskRendering: boolean
): RawTodoistTask {

    console.log("Generating RawTodoistTask for task:", task, "isSubtaskRendering:", isSubtaskRendering);
    if (isSubtaskRendering) {
        return {
            taskId: task.id,
            parentId: task.parent_id,
            content: task.content,
            dateCompleted: task.completed_at,
            dateCreated: task.added_at ?? null,
            projectId: task.project_id
        };
    } else {
        return {
            taskId: task.task_id,
            parentId: null as null,
            content: task.content,
            dateCompleted: task.completed_at,
            dateCreated: task.added_at ?? null,
            projectId: task.project_id,
        };
    }
}

export async function fetchTasks(
    authToken: string,
    timeFrames: any,
    renderSubtasks: boolean
): Promise<any> {
    const {
        timeStartFormattedDate,
        timeStartFormattedTime,
        timeEndFormattedDate,
        timeEndFormattedTime,
    } = timeFrames;

    const limit = renderSubtasks ? 30 : 200;

    let mappedResults: any[] = [];

    try {
        // Add 'Z' suffix to indicate UTC timezone for Todoist API
        const url =
            `https://api.todoist.com/api/v1/tasks/completed?since=` +
            timeStartFormattedDate +
            `T` +
            timeStartFormattedTime +
            `Z&until=` +
            timeEndFormattedDate +
            `T` +
            timeEndFormattedTime +
            `Z&limit=${limit}`;
        const completedTasksMetadata = await fetch(url, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        }).then(function (response) {
            return response.json();
        });

        console.log("Completed tasks metadata response:", completedTasksMetadata);

        // If there are no completed tasks, return an empty array
        if (completedTasksMetadata.items.length === 0) {
            return mappedResults;
        }

        const projectsMetadata = completedTasksMetadata.projects;

        new Notice(
            completedTasksMetadata.items.length +
                " completed tasks found. Processing..."
        );

        if (renderSubtasks) {
            const completedTasksPromises = completedTasksMetadata.items.map(
                async (task: TodoistApiTask) => {
                    return fetchSingleTask(authToken, task.task_id);
                }
            );
            mappedResults = await Promise.all(completedTasksPromises);

            let childTasks = mappedResults.filter(
                (task: RawTodoistTask) => task.parentId !== null
            );

            let queuedParentTasks = [] as string[];
            childTasks.forEach((task: RawTodoistTask) => {
                const parentTask = mappedResults.find(
                    (t: RawTodoistTask) => t.taskId === task.parentId
                );
                if (!parentTask && task.parentId && !queuedParentTasks.includes(task.parentId)) {
                    let missedParentTask = fetchSingleTask(
                        authToken,
                        task.parentId
                    );
                    mappedResults.push(missedParentTask);
                    queuedParentTasks.push(task.parentId);
                }
            });
            mappedResults = await Promise.all(mappedResults);

            console.log("Completed tasks with subtasks response:", mappedResults);

            // Merge metadata dates into the task objects
            mappedResults.forEach((task: RawTodoistTask) => {
                const taskMetadata = completedTasksMetadata.items.find(
                    (t: TodoistApiTask) => t.task_id === task.taskId
                );
                if (!taskMetadata) {
                    (task as { dateCompleted: string | null }).dateCompleted = null;
                } else {
                    (task as { dateCompleted: string | null }).dateCompleted = taskMetadata.completed_at;
                }
            });
        } else {
            mappedResults = completedTasksMetadata.items.map((task: TodoistApiTask) => {
                return generateRawTodoistTask(task, renderSubtasks);
            });
        }

        return {
            tasksResults: mappedResults,
            projectsResults: projectsMetadata,
        };
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

export async function fetchSingleTask(
    authToken: string,
    parentId: string
): Promise<any> {
    try {
        const url = `https://api.todoist.com/api/v1/tasks/${parentId}`;
        let parentTask = await fetch(url, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        const task: TodoistApiTask = await parentTask.json();

        return generateRawTodoistTask(task, true);
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
