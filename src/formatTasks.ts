import { moment } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";
import { RawTodoistTask } from "./fetchTasks";

export interface TodoistTask {
    taskId: string;
    content: string;
    dateCompleted: Date | null;
    dateCreated: Date | null;
    childTasks: TodoistTask[];
    projectId?: string | null;
}

function prepareTasksForRendering(tasks: RawTodoistTask[]): TodoistTask[] {
    function toNode(task: RawTodoistTask): TodoistTask {
        return {
            taskId: task.taskId,
            content: task.content,
            dateCompleted: task.dateCompleted ? new Date(task.dateCompleted) : null,
            dateCreated: task.dateCreated ? new Date(task.dateCreated) : null,
            projectId: task.projectId,
            childTasks: [],
        };
    }

    function buildHierarchy(parentId: string | null): TodoistTask[] {
        return tasks
            .filter((t) => t.parentId === parentId)
            .map((t) => {
                const node = toNode(t);
                node.childTasks = buildHierarchy(t.taskId);
                return node;
            });
    }

    return buildHierarchy(null);
}

function renderTasksAsText(
    tasks: TodoistTask[],
    projectsMetadata: Record<string, { name: string }>,
    settings: TodoistSettings
): string {
    function renderTaskFinishDate(task: TodoistTask): string {
        if (!task.dateCompleted) return "N/A";
        const m = moment(task.dateCompleted).local();
        const dt = m.format("YYYY-MM-DD HH:mm");
        const d = m.format("YYYY-MM-DD");
        const pf = settings.taskPostfix;
        if (/\{task_finish_datetime\}|\{current_datetime\}/.test(pf)) return dt;
        if (/\{task_finish_date\}|\{current_date\}/.test(pf)) return d;
        return dt;
    }

    function renderTaskCreatedDate(task: TodoistTask): string {
        if (!task.dateCreated) return "N/A";
        const m = moment(task.dateCreated).local();
        const pf = settings.taskPostfix;
        if (/\{task_created_datetime\}/.test(pf)) return m.format("YYYY-MM-DD HH:mm");
        return m.format("YYYY-MM-DD");
    }

    function renderTaskLink(task: TodoistTask): string {
        return `https://app.todoist.com/app/task/${task.taskId}`;
    }

    function renderTaskPostfix(task: TodoistTask): string {
        return settings.taskPostfix
            .replace(
                /{task_finish_date}|{task_finish_datetime}|{current_date}|{current_datetime}/g,
                () => renderTaskFinishDate(task)
            )
            .replace(/{task_created_date}|{task_created_datetime}/g, () =>
                renderTaskCreatedDate(task)
            )
            .replace(/{link}/g, () => renderTaskLink(task));
    }

    function renderTaskPrefix(_t: TodoistTask, idx: number): string {
        return settings.taskPrefix.replace(/{auto_increment}/g, `${idx + 1}`);
    }

    function renderTree(nodes: TodoistTask[], indent: number): string[] {
        return [...nodes].reverse().flatMap((t, idx) => {
            const tabs = settings.renderProjectsHeaders
                ? "\t".repeat(indent + 1)
                : "\t".repeat(indent);
            const line = `${tabs}${renderTaskPrefix(t, idx)} ${t.content} ${renderTaskPostfix(t)}`;
            if (t.childTasks.length) {
                return [line, ...renderTree(t.childTasks, indent + 1)];
            }
            return [line];
        });
    }

    const allLines: string[] = [];

    if (settings.renderProjectsHeaders) {
        for (const [projId, meta] of Object.entries(projectsMetadata)) {
            const projTasks = tasks.filter((t) => t.projectId === projId);
            if (!projTasks.length) continue;
            allLines.push(`* ${meta.name}`);
            allLines.push(...renderTree(projTasks, 0));
        }
    } else {
        allLines.push(...renderTree(tasks, 0));
    }

    if (allLines.length === 0) return "";
    return `\n${allLines.join("\n")}\n`;
}

export { renderTasksAsText, prepareTasksForRendering };
