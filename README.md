# Todoist Completed Tasks - Obsidian Plugin

This obsidian plugin fetches your completed tasks from Todoist and adds them to your obsidian note.

![](https://media0.giphy.com/media/AA77QNDGKG1SIZOHjk/giphy.gif?cid=790b761136fba1ad0e7d6dd47af2b5ead7f8dc6f641d87bc&rid=giphy.gif)

# Docs
1. [Features plan](docs/FEATURES.md)

# Usage
1. Ensure you understand the security implications (see Security section of this file)
2. Install this plugin (Todoist Completed Tasks) through Obsidian and enable it
   - (It is not yet available on the Obsidian plugin store, so you will need to download the zip file from the releases page and install it manually or through the BRAT plugin)
3. Enter your Todoist API token in the plugin settings, as explained there
4. Read below sections to learn how to manipulate tasks

## Start segment/End segment
The plugin renders the tasks between the start and end segment.
The segment can be configured in the plugin settings. You can choose any segment name you want.

## Security 
This plugin stores your Todoist API token in plain text in your .obsidian/plugins folder. Anyone with your Todoist API token could access and manipulate all of your Todoist data. Ensure that you are not syncing/sharing your .obsidian/plugins folder for security purposes. Use this plugin at your own risk.


## Attribution
This plugin is heavily influenced by the [Todoist Text](https://github.com/wesmoncrief/obsidian-todoist-text) plugin. Thank you Wes!
