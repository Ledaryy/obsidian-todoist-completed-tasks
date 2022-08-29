import { TodoistSettings, DEFAULT_SETTINGS } from "./DefaultSettings";

export function migrateSettings(settings: any): TodoistSettings {
	let newSettings: any = settings;
	if (getSettingsVersion(newSettings) == 0) {
		newSettings = migrateToV1(settings as TodoistSettingV0);
	}

	return newSettings;
}

function getSettingsVersion(settings: any): number {
	// v0 didn't have this field
	return settings.settingsVersion ?? 0;
}

function migrateToV1(settings: TodoistSettingV0): TodoistSettings {
	return {
		settingsVersion: 1,
		authToken: settings.authToken,
		keywordSegmentStart: DEFAULT_SETTINGS.keywordSegmentStart,
		keywordSegmentEnd: DEFAULT_SETTINGS.keywordSegmentEnd,
	};
}

interface TodoistSettingV0 {
	authToken: string;
}
