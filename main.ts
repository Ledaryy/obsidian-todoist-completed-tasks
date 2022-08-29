import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import moment from 'moment';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('sync', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			const timeInput = "2022-08-29"
			const currentTime = new Date()

			// const timeStart = 
			const timeStart = new Date(Date.parse(timeInput + "T00:00:00Z"));
			// const correctDate = 
			const correctTime = new Date(timeStart.getTime() + (currentTime.getTimezoneOffset() * 60 * 1000));
			const formattedDate = moment(correctTime).format('YYYY-MM-DD'); 
			const formattedTime = moment(correctTime).format('HH:mm');
			console.log(formattedDate)
			console.log(formattedTime)


			console.log(currentTime.toUTCString())
			console.log(timeStart.toUTCString())

			console.log(correctTime.toUTCString())

			// console.log(timeStart.toUTCString());
			
			async function getTasks() {
				const url = `https://api.todoist.com/sync/v8/completed/get_all?since=` + formattedDate + `T` + formattedTime + `&until=` + timeInput + `T23:59`;
				console.log(url)
				const response = await fetch(url, {
					headers: {
						"Authorization": ""
					}
				}).then(function (response) {
					// console.log(response.json());
					return response.json();
				});
				console.log(response);
			}
			getTasks();

			new Notice("Loading tasks...");
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'todoist-fetch-completed-tasks',
			name: 'Fetch completed tasks',
			callback: async () => {
				console.log("Trying to fetch API")
				// if (this.api != null) {
				//   debug("Refreshing metadata");
				//   const result = await this.api.fetchMetadata();

				//   if (result.isErr()) {
				// 	console.error(result.unwrapErr());
				//   }
				// }
				// const url = `https://api.todoist.com/sync/v8/completed/get_all?since=` + date + `T00:00&until=` + date + `T23:59`;
				const url = `https://api.todoist.com/sync/v8/completed/get_all?since=` + "2022-08-29" + `T00:00&until=` + "2022-08-29" + `T23:59`;
				const response = await fetch(url, {
					headers: {
						"Authorization": ""
					}
				}).then(function (response) {
					// console.log(response.json());
					return response.json();
				});
				console.log(response);
				// const repositories = await response.json();
				// return repositories;
			},
		});


	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
