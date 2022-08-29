import { Notice, Plugin } from 'obsidian';
import { updateFileFromServer } from "./src/updateFileContent";
import { DEFAULT_SETTINGS, TodoistSettings } from "./src/DefaultSettings";
import {migrateSettings} from "./src/settingsMigrations";

export default class MyPlugin extends Plugin {
	settings: TodoistSettings;

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('sync', 'TCT: Fetch completed tasks', (evt: MouseEvent) => {
			new Notice("Loading tasks...");
			updateFileFromServer(this.settings, this.app)

		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.addCommand({
			id: 'todoist-fetch-completed-tasks',
			name: 'Fetch completed tasks',
			callback: async () => {
				new Notice("Loading tasks...");
				updateFileFromServer(this.settings, this.app)
			},
		});
	}

	onunload() {

	}

	async loadSettings() {
		let storedSettings = await this.loadData() ?? DEFAULT_SETTINGS;
		this.settings = migrateSettings(storedSettings);
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

