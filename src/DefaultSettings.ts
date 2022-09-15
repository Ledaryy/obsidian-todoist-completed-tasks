export interface TodoistSettings {
	settingsVersion: number;
	keywordSegmentStart: string;
	keywordSegmentEnd: string;
	authToken: string;
	taskPrefix: string;
};

export const DEFAULT_SETTINGS: TodoistSettings = {
	settingsVersion: 2,
	keywordSegmentStart: "%% COMPLETED_TODOIST_TASKS_START %%",
	keywordSegmentEnd: "%% COMPLETED_TODOIST_TASKS_END %%",
	authToken: "",
	taskPrefix: "*"
};
