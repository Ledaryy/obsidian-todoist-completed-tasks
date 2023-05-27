import { App, Modal, Setting } from "obsidian";

export class ExampleModal extends Modal {
    result: string;
    onSubmit: (result: string) => void;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", {
            text: "Fetch completed tasks for last N hours",
        });

        new Setting(contentEl).setName("Hours").addText((text) =>
            text.onChange((value) => {
                this.result = value;
            })
        );

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText("Fetch")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(this.result);
                })
        );
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
