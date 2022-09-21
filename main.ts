import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { updateFileFromServer } from "./src/updateFileContent";
import { DEFAULT_SETTINGS, TodoistSettings } from "./src/DefaultSettings";
import { migrateSettings } from "./src/settingsMigrations";
import { ExampleModal } from "./src/modal";
import { getTimeframesForLastNHoursWithoutOffset } from "./src/utils";

export default class TodoistCompletedTasks extends Plugin {
	settings: TodoistSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon(
			"sync",
			"Fetch today's completed todoist tasks",
			(evt: MouseEvent) => {
				new Notice("Fetching completed tasks..");
				updateFileFromServer(this.settings, this.app, 0);
			}
		);

		this.addCommand({
			id: "todoist-fetch-completed-tasks",
			name: "Fetch today's completed todoist tasks",
			callback: async () => {
				new Notice("Fetching completed tasks..");
				updateFileFromServer(this.settings, this.app, 0);
			},
		});

		this.addCommand({
			id: "todoist-fetch-completed-tasks-for-last-n-hours",
			name: "Fetch completed todoist tasks for last n hours",
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

					new Notice(
						`Fetching completed tasks for last ${result} hours.. ` +
							`\nTimerange, from: \n${timeStartFormattedDate} ${timeStartFormattedTime} \n` +
							`to: \n${timeEndFormattedDate} ${timeEndFormattedTime}. \nMessage will ` +
							`be removed after 30 sec.`,
						30000
					);
					updateFileFromServer(
						this.settings,
						this.app,
						Number(result)
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

class TodoistPluginSettingTab extends PluginSettingTab {
	plugin: TodoistCompletedTasks;

	constructor(app: App, plugin: TodoistCompletedTasks) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Todoist Completed Tasks" });
		containerEl.createEl("a", {
			text: "Important - see usage instructions",
			href: "https://github.com/Ledaryy/obsidian-todoist-completed-tasks",
		});

		this.addApiKeySetting(containerEl);
		this.addStartLineDetector(containerEl);
		this.addEndLineDetector(containerEl);
		this.addTaskPrefix(containerEl);
	}

	private addApiKeySetting(containerEl: HTMLElement) {
		const fieldDescription = document.createDocumentFragment();
		fieldDescription.createEl("span", null, (span) => {
			span.innerText =
				"This is your personal authentication token for Todoist. Be aware that anyone with this token " +
				"could access all of your Todoist data. This is stored in plain text in your .obsidian/plugins folder." +
				" Ensure that you are comfortable with the security implications before proceeding. " +
				'You can get your token from the "API token" section ';

			span.createEl("a", null, (link) => {
				link.href = "https://todoist.com/prefs/integrations";
				link.innerText = "here.";
			});
		});
		new Setting(containerEl)
			.setName("API token")
			.setDesc(fieldDescription)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.authToken)
					.onChange(async (value) => {
						this.plugin.settings.authToken = value;
						await this.plugin.saveSettings();
					})
			);
	}
	private addStartLineDetector(containerEl: HTMLElement) {
		const fieldDescription = document.createDocumentFragment();
		fieldDescription.createEl("span", null, (span) => {
			span.innerText =
				"Segment for the plugin to detect the start of tasks. Supports Obsidian's comments syntax.";
		});
		new Setting(containerEl)
			.setName("Start line detector")
			.setDesc(fieldDescription)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.keywordSegmentStart)
					.onChange(async (value) => {
						this.plugin.settings.keywordSegmentStart = value;
						await this.plugin.saveSettings();
					})
			);
	}
	private addEndLineDetector(containerEl: HTMLElement) {
		const fieldDescription = document.createDocumentFragment();
		fieldDescription.createEl("span", null, (span) => {
			span.innerText =
				"Segment for the plugin to detect the end of tasks. Supports Obsidian's comments syntax.";
		});
		new Setting(containerEl)
			.setName("End line detector")
			.setDesc(fieldDescription)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.keywordSegmentEnd)
					.onChange(async (value) => {
						this.plugin.settings.keywordSegmentEnd = value;
						await this.plugin.saveSettings();
					})
			);
	}
	private addTaskPrefix(containerEl: HTMLElement) {
		const fieldDescription = document.createDocumentFragment();
		fieldDescription.createEl("span", null, (span) => {
			span.innerText =
				"Set prefix for tasks. Supports bullet points '*', checkboxes '- [x]' and '- [ ]', etc. It also supports the special parameter '$AUTOINCREMENT' which will be replaced with an auto-increment number.";
		});
		new Setting(containerEl)
			.setName("Prefix")
			.setDesc(fieldDescription)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.taskPrefix)
					.onChange(async (value) => {
						this.plugin.settings.taskPrefix = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
