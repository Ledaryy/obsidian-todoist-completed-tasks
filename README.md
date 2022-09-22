# Todoist Completed Tasks - Obsidian Plugin

This obsidian plugin fetches your completed tasks from Todoist and adds them to your obsidian note.

![demo](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/plugin_preview.gif?raw=true)

# Docs
1. [Features plan](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/FEATURES.md)
2. [Known Bugs](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/KNOWN_BUGS.md)
3. [Tricks and tips](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/ADVANCED.md) (for Advanced users)

# Usage
1. Install this plugin (Todoist Completed Tasks) through Obsidian and **enable** it
2. Enter your Todoist API token in the plugin settings. 
   - **Security risks** and **API Token Installation guide** available [here](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/docs/API_KEY_INSTALLATION.md)
3. Place start segment and end segment in your note
   - **Start segment** is a line with `%% COMPLETED_TODOIST_TASKS_START %%` 
   - **End segment** is a line with `%% COMPLETED_TODOIST_TASKS_END %%`
4. Run the plugin
   - By clicking the 🔄 button in the left sidebar
   - By executing `(Ctrl+P > Todoist Completed Tasks: Fetch completed tasks)`
5. Done!

## Attribution
This plugin is heavily influenced by the [Todoist Text](https://github.com/wesmoncrief/obsidian-todoist-text) plugin.
