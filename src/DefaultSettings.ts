export interface TodoistSettings {
	settingsVersion: number;
	keywordSegmentStart: string;
	keywordSegmentEnd: string;
	authToken: string;
};

export const DEFAULT_SETTINGS: TodoistSettings = {
	settingsVersion: 1,
	keywordSegmentStart: "$startOfSegmentForCompletedTasks",
	keywordSegmentEnd: "$endOfSegmentForCompletedTasks",
	authToken: "",
};
