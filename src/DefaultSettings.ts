export interface TodoistSettings {
	settingsVersion: number;
	keywordSegmentStart: string;
	keywordSegmentEnd: string;
	authToken: string;
};

export const DEFAULT_SETTINGS: TodoistSettings = {
	settingsVersion: 1,
	keywordSegmentStart: "> Tasks:",
	keywordSegmentEnd: "* <",
	authToken: "",
};
