# Todoist Completed Tasks - Obsidian Plugin

This obsidian plugin fetches your completed tasks from Todoist and adds them to your obsidian note.

![demo](https://raw.githubusercontent.com/Ledaryy/obsidian-todoist-completed-tasks/master/static/gif/plugin_preview_v1.2.0.gif)

# Docs
1. [Features plan](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/FEATURES.md)
2. [Known Bugs](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/KNOWN_BUGS.md)
3. [Advanced usage](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/ADVANCED.md)

# Usage
1. Install this plugin (Todoist Completed Tasks) through Obsidian and **enable** it
2. Enter your Todoist API token in the plugin settings. 
   - **Security risks** and **API Token Installation guide** available [here](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/API_KEY_INSTALLATION.md)
3. Place start segment and end segment in your note
   - **Start segment** is a line with `%% COMPLETED_TODOIST_TASKS_START %%` 
   - **End segment** is a line with `%% COMPLETED_TODOIST_TASKS_END %%`
4. Run the plugin
   - By clicking the 🔄 button in the left sidebar
   - By executing `(Ctrl+P > Todoist Completed Tasks: Fetch today's completed tasks)`
5. Done! Also check out the [Advanced usage](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/ADVANCED.md) of the plugin. It has many cool features!

## Features
- Fetch today's completed tasks
- Fetch completed tasks for the last N hours
- Fetch completed tasks using dates from segments ([Templater](https://github.com/SilentVoid13/Templater) support)
- Customizable prefix and postfix for each task ([Obsidian Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) support)

## Say Thanks 🙏
If you like this plugin and would like to buy me a coffee, you can!
[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/ledaryy)

## Attribution
This plugin is heavily influenced by the [Todoist Text](https://github.com/wesmoncrief/obsidian-todoist-text) plugin.
