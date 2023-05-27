import { App, PluginSettingTab, Setting } from "obsidian";
import TodoistCompletedTasks from "../main";

export class TodoistPluginSettingTab extends PluginSettingTab {
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
        this.addTaskPostfix(containerEl);
        this.addProjectsRenderSwitch(containerEl);
        this.addSubtaskRenderSwitch(containerEl);
    }

    private addApiKeySetting(containerEl: HTMLElement) {
        const fieldDescription = document.createDocumentFragment();
        fieldDescription.createEl("span", null, (span) => {
            span.innerText =
                "This is your personal authentication token for Todoist. Be aware that anyone with this token " +
                "could access all of your Todoist data. This is stored in plain text in your .obsidian/plugins folder." +
                " Ensure that you are comfortable with the security implications before proceeding. " +
                '\nYou can get your token from the "API token" section ';

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
                "Segment for the plugin to detect the start of tasks. " +
                "\nSupports Obsidian's comments syntax.";
        });
        new Setting(containerEl)
            .setName("Start segment")
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
                "Segment for the plugin to detect the end of tasks. " +
                "\nSupports Obsidian's comments syntax.";
        });
        new Setting(containerEl)
            .setName("End segment")
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
                "Set prefix for tasks. Popular usecases:" +
                '\n"*" - Bullet points' +
                '\n"- [x]" - Completed checkboxes' +
                '\n"{auto_increment}. " - Ideally works with obsidian markdown and marks tasks and subtasks as a lists' +
                "\n" +
                '\nThe special parameter "{auto_increment}" ' +
                "will be replaced with an auto-increment number." +
                "\nFor all other parameters, refer to the ";
            span.createEl("a", null, (link) => {
                link.href = "https://www.markdownguide.org/tools/obsidian/";
                link.innerText = "Obsidian Markdown";
            });
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

    private addTaskPostfix(containerEl: HTMLElement) {
        const fieldDescription = document.createDocumentFragment();
        fieldDescription.createEl("span", null, (span) => {
            span.innerText =
                "Set postfix for tasks. Popular usecases:" +
                '\n"💪" - Keep it up!' +
                '\n"✅{task_finish_date}" - to make it compatible with ';
            span.createEl("a", null, (link) => {
                link.href =
                    "https://github.com/obsidian-tasks-group/obsidian-tasks";
                link.innerText = "Obsidian Tasks";
            });
            span.createEl("p", null, (textSpace) => {
                textSpace.innerText =
                    'The special parameter "{current_date}"' +
                    ' will be replaced with current date in "YYYY-MM-DD" format.' +
                    '\nAnother special parameter "{task_finish_date}"' +
                    ' will be replaced with task finish date in "YYYY-MM-DD" format.' +
                    "\nAlso you can use {task_finish_datetime} and {current_datetime}" +
                    ' to get date and time in "YYYY-MM-DD HH:MM:SS" format.' +
                    "\nNote: Non-completed parent tasks can have completed subtasks, 'N/A' will be used for the parent in this case.";
            });
        });
        new Setting(containerEl)
            .setName("Postfix")
            .setDesc(fieldDescription)
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.taskPostfix)
                    .onChange(async (value) => {
                        this.plugin.settings.taskPostfix = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addProjectsRenderSwitch(containerEl: HTMLElement) {
        const fieldDescription = document.createDocumentFragment();
        fieldDescription.createEl("span", null, (span) => {
            span.innerText =
                "Renders projects names as headers. " +
                "\nIf disabled, projects names will not be rendered at all.";
        });
        new Setting(containerEl)
            .setName("Render projects names")
            .setDesc(fieldDescription)
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.renderProjectsHeaders)
                    .onChange(async (value) => {
                        this.plugin.settings.renderProjectsHeaders = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addSubtaskRenderSwitch(containerEl: HTMLElement) {
        const fieldDescription = document.createDocumentFragment();
        fieldDescription.createEl("span", null, (span) => {
            span.innerText =
                "You should disable this if you want to load more than 30 (up to 200) tasks. " +
                "This is due to a limitation of the Todoist API." +
                "\nIf enabled, subtasks will be rendered as subtasks. " +
                "\nIf disabled, subtasks will be rendered as normal tasks." +
                "\nDramatically increases loading time if enabled.";
        });
        new Setting(containerEl)
            .setName("Render subtasks")
            .setDesc(fieldDescription)
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.renderSubtasks)
                    .onChange(async (value) => {
                        this.plugin.settings.renderSubtasks = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
