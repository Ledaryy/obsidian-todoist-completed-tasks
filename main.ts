import { Notice, Plugin } from "obsidian";
import { updateFileFromServer } from "./src/updateFileContent";
import { DEFAULT_SETTINGS, TodoistSettings } from "./src/DefaultSettings";
import { migrateSettings } from "./src/settingsMigrations";
import { ExampleModal } from "./src/modal";
import { getTimeframesForLastNHoursWithoutOffset } from "./src/utils";
import { TodoistPluginSettingTab } from "./src/settingsTabs";
import { FETCH_STRATEGIES } from "./src/constants";

export default class TodoistCompletedTasks extends Plugin {
	settings: TodoistSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon(
			"sync",
			"Fetch today's completed Todoist tasks",
			(evt: MouseEvent) => {
				new Notice("Fetching completed tasks..");
				updateFileFromServer(this.settings, this.app, 0, FETCH_STRATEGIES.today);
			}
		);

		this.addCommand({
			id: "todoist-fetch-completed-tasks",
			name: "Fetch today's completed Todoist tasks",
			callback: async () => {
				new Notice("Fetching completed tasks..");
				updateFileFromServer(this.settings, this.app, 0, FETCH_STRATEGIES.today);
			},
		});

		this.addCommand({
			id: "todoist-fetch-completed-tasks",
			name: "Fetch completed Todoist tasks from range in segment start",
			callback: async () => {
				new Notice("Fetching completed tasks..");
				updateFileFromServer(this.settings, this.app, 0, FETCH_STRATEGIES.fromFile);
			},
		});

		this.addCommand({
			id: "todoist-fetch-completed-tasks-for-last-n-hours",
			name: "Fetch completed Todoist tasks for last n hours",
			callback: async () => {
				new ExampleModal(this.app, (result) => {
					if (
						result == null ||
						result == "" ||
						isNaN(Number(result)) ||
						Number(result) < 0
					) {
						new Notice("Please enter a valid number of hours");
						return;
					}

					let times = getTimeframesForLastNHoursWithoutOffset(
						Number(result)
					);
					const {
						timeStartFormattedDate,
						timeStartFormattedTime,
						timeEndFormattedDate,
						timeEndFormattedTime,
					} = times;

					if (this.settings.renderSubtasks) {
						new Notice(
							`You are fetching completed tasks with "Render subtasks" enabled. ` +
								`\nThis will limit the number of tasks fetched to 30.` +
								`\nMessage will be removed after 30 sec.`,
							30000
						);
					}

					new Notice(
						`Fetching completed tasks for last ${result} hours.. ` +
							`\nTimerange, from: \n${timeStartFormattedDate} ${timeStartFormattedTime} ` +
							`\nto: ` +
							`\n${timeEndFormattedDate} ${timeEndFormattedTime}. ` +
							`\nMessage will be removed after 30 sec.`,
						30000
					);
					updateFileFromServer(
						this.settings,
						this.app,
						Number(result),
						FETCH_STRATEGIES.lastNHours
					);
				}).open();
			},
		});

		this.addSettingTab(new TodoistPluginSettingTab(this.app, this));
	}

	async loadSettings() {
		let storedSettings = (await this.loadData()) ?? DEFAULT_SETTINGS;
		this.settings = migrateSettings(storedSettings);
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
