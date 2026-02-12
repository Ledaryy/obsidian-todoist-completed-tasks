## Start segment/End segment

The plugin renders the tasks between the start and end segments.
The segments can be configured in the plugin settings. You can choose any segment name you want.

Quick preview of how I use my segments:
![advanced_segments_demo](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/static/gif/advanced_segments.gif)

But I do still recommend using obsidian comments (default tags). Because you can hide it preview. See this demo.
![obsidian_comments_trick](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/static/gif/obsidian_comments_trick.gif)

## Prefix/Postfix

The plugin will render the tasks with the prefix and postfix.
You can use the HTML in the prefix/postfix to make it look better. For example, this is how I use it. There is a dash and a task finish DateTime. All wrapped in a span with a grey colour and small font size.
`<span style="color:grey; font-size:10px">- {task_finish_datetime}</span>`

You can also use `{link}` to insert a direct web link to the task in Todoist (e.g. `https://app.todoist.com/app/task/<taskId>`). This is useful if you keep comments and details in your Todoist tasks and want to quickly jump back to them.
Example: `[Open in Todoist]({link})` will render a clickable Markdown link to the task.
Demo:
![advanced_prefix_postfix_demo](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/static/img/postfix.png)

## Render project name as header

The Plugin will structure all the task below corresponding project name. Unfortunately it is not possible at the moment to render sub projects names, so the will be rendered as a regular project. But I will try to implement it in the future.
Demo:
![advanced_render_project_name_as_header_demo](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/static/img/projects_headers.png)

## Fetching today's tasks

There are a bit more details on how the plugin fetches the "today's" tasks.
The plugin gets the current day number and your timezone from Obsidian. Then it gets a time range from 00:00 to 23:59 for that day. Then it converts it to UTC (because all completed tasks time is stored in UTC at the Todoist server). And finally, it fetches the tasks from Todoist API.

## Fetching tasks for the last N hours

It can be used only from the command palette (no button on the left panel for this). Will present prompt modal to enter a number of hours.
There are no limits on how many hours you want to fetch, it can be days, months, or years. But see the **"API limitations and Subtask rendering"** section for limitations.
Uses the same logic as "today's" tasks. But instead of getting the current day number, it gets the current DateTime and subtracts N hours from it. Then it gets the time range from that DateTime to the current day/hour. Then it converts it to UTC (because all completed tasks time is stored in UTC at the Todoist server). And finally, it fetches the tasks from the Todoist API.

## Fetching tasks using dates from segments

It can be used only from the command palette (no button on the left panel for this).
This command will require two special segments (not configurable yet)

-   Start segment example: `%% TCT_TEMPLATED_START 1999-12-01 00:00 %%`
-   End segment example: `%% TCT_TEMPLATED_END 2022-04-28 23:59 %%`

The date format is `{{YYYY-MM-DD HH:mm}}`. See the demo below.
![fetch_using_dates_from_template](https://github.com/Ledaryy/obsidian-todoist-completed-tasks/blob/master/static/gif/fetch_using_dates_from_template.gif)
Uses the same logic as "today's" tasks. But instead of getting the current day number, it gets the date range from the segment. Then it converts it to UTC (because all completed tasks time is stored in UTC at the Todoist server). And finally, it fetches the tasks from the Todoist API.

## API limitations and Subtask rendering

This section applies to both "today's tasks" and "last N hours" fetching.

### Without subtask rendering

It will just take the task descriptions and will render them as a list. And place to the note.
This API call will return only 200 tasks. There is a turnaround to fetch an unlimited amount of tasks, but it is not implemented yet. So this is a plugin limitation, not the Todoist API limitation.

### With subtask rendering

It will take each task ID for each fetched task. And will fetch full details for each task. This is needed to get the parent task ID because Todoist API will not give us this information in the initial call for completed tasks. And is the reason because it will take much more time to render the tasks with subtasks. Then it will match the child's tasks with the parent's tasks and will render them. And place to the note.
It seems like Todoist accepts only 30 calls for task details in a given period. So I limited the plugin to 30 tasks. If you have more than 30 tasks, it will just render the first 30 tasks. So if you want to render more than 30 tasks, you will need to disable subtasks rendering in the plugin settings.

P.S. This text possibly contains a lot of typos. It would be nice if someone can help me with this. Thanks!
