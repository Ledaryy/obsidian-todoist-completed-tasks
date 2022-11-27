import { TodoistSettings, DEFAULT_SETTINGS } from "./DefaultSettings";

export function migrateSettings(settings: any): TodoistSettings {
	let newSettings: any = settings;
	if (getSettingsVersion(newSettings) == 0) {
		newSettings = migrateToV1(settings as TodoistSettingV0);
	}
	if (getSettingsVersion(newSettings) == 1) {
		newSettings = migrateToV2(newSettings as TodoistSettingsV1);
	}
	if (getSettingsVersion(newSettings) == 2) {
		newSettings = migrateToV3(newSettings as TodoistSettingsV2);
	}
	if (getSettingsVersion(newSettings) == 3) {
		newSettings = migrateToV4(newSettings as TodoistSettingsV3);
	}

	return newSettings;
}

function getSettingsVersion(settings: any): number {
	// v0 didn't have this field
	return settings.settingsVersion ?? 0;
}

function migrateToV1(settings: TodoistSettingV0): TodoistSettingsV1 {
	return {
		settingsVersion: 1,
		keywordSegmentStart: DEFAULT_SETTINGS.keywordSegmentStart,
		keywordSegmentEnd: DEFAULT_SETTINGS.keywordSegmentEnd,
		authToken: settings.authToken,
	};
}

function migrateToV2(settings: TodoistSettingsV1): TodoistSettingsV2 {
	return {
		settingsVersion: 2,
		keywordSegmentStart: settings.keywordSegmentStart,
		keywordSegmentEnd: settings.keywordSegmentEnd,
		authToken: settings.authToken,
		taskPrefix: DEFAULT_SETTINGS.taskPrefix,
	};
}

function migrateToV3(settings: TodoistSettingsV2): TodoistSettingsV3 {
	return {
		settingsVersion: 3,
		keywordSegmentStart: settings.keywordSegmentStart,
		keywordSegmentEnd: settings.keywordSegmentEnd,
		authToken: settings.authToken,
		taskPrefix: settings.taskPrefix,
		renderSubtasks: DEFAULT_SETTINGS.renderSubtasks,
	};
}

function migrateToV4(settings: TodoistSettingsV3): TodoistSettings {
	return {
		settingsVersion: 4,
		keywordSegmentStart: settings.keywordSegmentStart,
		keywordSegmentEnd: settings.keywordSegmentEnd,
		authToken: settings.authToken,
		taskPrefix: settings.taskPrefix,
		taskPostfix: DEFAULT_SETTINGS.taskPostfix,
		renderSubtasks: settings.renderSubtasks,
	};
}

interface TodoistSettingV0 {
	authToken: string;
}

interface TodoistSettingsV1 {
	settingsVersion: number;
	keywordSegmentStart: string;
	keywordSegmentEnd: string;
	authToken: string;
}

interface TodoistSettingsV2 {
	settingsVersion: number;
	keywordSegmentStart: string;
	keywordSegmentEnd: string;
	authToken: string;
	taskPrefix: string;
}

interface TodoistSettingsV3 {
	settingsVersion: number;
	keywordSegmentStart: string;
	keywordSegmentEnd: string;
	authToken: string;
	taskPrefix: string;
	renderSubtasks: boolean;
}
