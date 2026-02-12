import { App, Notice, MarkdownView } from "obsidian";
import { TodoistSettings } from "./DefaultSettings";
import { fetchTasks } from "./fetchTasks";
import { renderTasksAsText, prepareTasksForRendering } from "./formatTasks";
import { FETCH_STRATEGIES } from "./constants";
import {
    getTimeframesForUsersToday,
    getTimeframesForLastNHours,
    getTimeFromKeySegments,
    settingsCheck,
    segmentsCheck,
} from "./utils";

export async function updateFileFromServer(
    settings: TodoistSettings,
    app: App,
    time: number,
    fetchStrategy: string
) {
    const editor = app.workspace.getActiveViewOfType(MarkdownView).editor;
    const fileContent = editor.getValue();

    if (
        !settingsCheck(settings) ||
        !segmentsCheck(fileContent, settings, fetchStrategy)
    ) {
        return;
    }

    let timeFrames: {
        timeStartFormattedDate: string;
        timeStartFormattedTime: string;
        timeEndFormattedDate: string;
        timeEndFormattedTime: string;
        startString?: string;
        endString?: string;
    } | null = null;

    if (fetchStrategy === FETCH_STRATEGIES.today) {
        timeFrames = getTimeframesForUsersToday();
    }
    if (fetchStrategy === FETCH_STRATEGIES.lastNHours) {
        timeFrames = getTimeframesForLastNHours(time);
    }
    if (fetchStrategy === FETCH_STRATEGIES.fromFile) {
        timeFrames = getTimeFromKeySegments(fileContent);
    }

    if (timeFrames === null) {
        new Notice("Invalid time frame.", 10000);
        return;
    }

    const fetchResults = await fetchTasks(
        settings.authToken,
        timeFrames,
        settings.renderSubtasks
    );

    if (fetchResults.length === 0) {
        new Notice(
            "No completed tasks found for the given timeframe \nSometimes Todoist API returns empty results. \nPlease try again later."
        );
        return;
    }

    const formattedTasks = prepareTasksForRendering(fetchResults.tasksResults);
    let renderedText = renderTasksAsText(
        formattedTasks,
        fetchResults.projectsResults,
        settings
    );

    let rangeStart = fileContent.indexOf(settings.keywordSegmentStart);
    let rangeEnd = fileContent.indexOf(settings.keywordSegmentEnd);

    if (fetchStrategy === FETCH_STRATEGIES.fromFile) {
        rangeStart = fileContent.indexOf(timeFrames.startString);
        rangeEnd = fileContent.indexOf(timeFrames.endString);
        renderedText = `${timeFrames.startString}${renderedText}`;
    } else {
        renderedText = `${settings.keywordSegmentStart}${renderedText}`;
    }
    editor.replaceRange(
        renderedText,
        editor.offsetToPos(rangeStart),
        editor.offsetToPos(rangeEnd)
    );

    new Notice("Completed tasks loaded.");
}
