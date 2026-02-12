import { Notice, Plugin } from "obsidian";
import { updateFileFromServer } from "./src/updateFileContent";
import { DEFAULT_SETTINGS, TodoistSettings } from "./src/DefaultSettings";
import { migrateSettings } from "./src/settingsMigrations";
import { ExampleModal } from "./src/modal";
import { TodoistPluginSettingTab } from "./src/settingsTabs";
import { FETCH_STRATEGIES } from "./src/constants";

export default class TodoistCompletedTasks extends Plugin {
    settings!: TodoistSettings;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon("sync", "Fetch today's completed tasks", (evt: MouseEvent) => {
            new Notice("Fetching completed tasks..");
            updateFileFromServer(this.settings, this.app, 0, FETCH_STRATEGIES.today);
        });

        this.addCommand({
            id: "todoist-fetch-today-completed-tasks",
            name: "Fetch today's completed tasks",
            callback: async () => {
                new Notice("Fetching completed tasks..");
                updateFileFromServer(this.settings, this.app, 0, FETCH_STRATEGIES.today);
            },
        });

        this.addCommand({
            id: "todoist-fetch-completed-tasks",
            name: "Fetch completed tasks using dates in segments",
            callback: async () => {
                new Notice("Fetching completed tasks..");
                updateFileFromServer(this.settings, this.app, 0, FETCH_STRATEGIES.fromFile);
            },
        });

        this.addCommand({
            id: "todoist-fetch-completed-tasks-for-last-n-hours",
            name: "Fetch completed tasks for last N hours",
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

                    if (this.settings.renderSubtasks) {
                        new Notice(
                            `You are fetching completed tasks with "Render subtasks" enabled. ` +
                                `\nThis will limit the number of tasks fetched to 30.`,
                            15000
                        );
                    }

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
        const storedSettings = (await this.loadData()) ?? DEFAULT_SETTINGS;
        this.settings = migrateSettings(storedSettings);
        await this.saveSettings();
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
