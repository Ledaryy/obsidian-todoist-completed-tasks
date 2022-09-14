import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { updateFileFromServer } from "./src/updateFileContent";
import { DEFAULT_SETTINGS, TodoistSettings } from "./src/DefaultSettings";
import { migrateSettings } from "./src/settingsMigrations";

export default class TodoistCompletedTasks extends Plugin {
	settings: TodoistSettings;

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon(
			"sync",
			"Fetch today's completed todoist tasks",
			(evt: MouseEvent) => {
				new Notice("Loading tasks...");
				updateFileFromServer(this.settings, this.app);
			}
		);

		this.addCommand({
			id: "todoist-fetch-completed-tasks",
			name: "Fetch today's completed todoist tasks",
			callback: async () => {
				new Notice("Loading tasks...");
				updateFileFromServer(this.settings, this.app);
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
	}

	private addApiKeySetting(containerEl: HTMLElement) {
		const tokenDescription = document.createDocumentFragment();
		tokenDescription.createEl("span", null, (span) => {
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
			.setDesc(tokenDescription)
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
		const tokenDescription = document.createDocumentFragment();
		tokenDescription.createEl("span", null, (span) => {
			span.innerText = "This one is for plugin to detect start of tasks.";
		});
		new Setting(containerEl)
			.setName("Start line detector")
			.setDesc(tokenDescription)
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
		const tokenDescription = document.createDocumentFragment();
		tokenDescription.createEl("span", null, (span) => {
			span.innerText = "This one is for plugin to detect end of tasks.";
		});
		new Setting(containerEl)
			.setName("End line detector")
			.setDesc(tokenDescription)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.keywordSegmentEnd)
					.onChange(async (value) => {
						this.plugin.settings.keywordSegmentEnd = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
