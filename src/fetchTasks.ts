import { Notice } from "obsidian";

export interface RawTodoistTask {
    readonly taskId: string;
    readonly parentId: string | null;
    readonly content: string;
    readonly dateCompleted: string | null;
    readonly projectId: string;
}

function generateRawTodoistTask(
    task: any,
    isSubtaskRendering: boolean
): RawTodoistTask {
    if (isSubtaskRendering) {
        return {
            taskId: task.id,
            parentId: task.parent_id,
            content: task.content,
            dateCompleted: task.completed_at,
            projectId: task.project_id
        };
    } else {
        return {
            taskId: task.task_id,
            parentId: null as null,
            content: task.content,
            dateCompleted: task.completed_at,
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
                async (task: { task_id: string }) => {
                    return fetchSingleTask(authToken, task.task_id);
                }
            );
            mappedResults = await Promise.all(completedTasksPromises);

            let childTasks = mappedResults.filter(
                (task: RawTodoistTask) => task.parentId !== null
            );

            let queuedParentTasks = [] as string[];
            childTasks.forEach((task: any) => {
                const parentTask = mappedResults.find(
                    (t: RawTodoistTask) => t.taskId === task.parentId
                );
                if (!parentTask && !queuedParentTasks.includes(task.parentId)) {
                    let missedParentTask = fetchSingleTask(
                        authToken,
                        task.parentId
                    );
                    mappedResults.push(missedParentTask);
                    queuedParentTasks.push(task.parentId);
                }
            });
            mappedResults = await Promise.all(mappedResults);

            // Merge metadata dates into the task objects
            mappedResults.forEach((task: any) => {
                const taskMetadata = completedTasksMetadata.items.find(
                    (t: any) => t.task_id === task.taskId
                );
                if (!taskMetadata) {
                    task.dateCompleted = null;
                } else {
                    task.dateCompleted = taskMetadata.completed_at;
                }
            });
        } else {
            mappedResults = completedTasksMetadata.items.map((task: any) => {
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
        const task = await parentTask.json();

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
