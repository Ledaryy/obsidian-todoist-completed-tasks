import { moment, Notice } from "obsidian";
import {
    CONSTANTS_SEGMENTS,
    CONSTANTS_REGEX,
    FETCH_STRATEGIES,
} from "./constants";

function getTimeframesForUsersToday() {
    const now = new Date();
    const startLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const endLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
    );

    const mStart = moment(startLocal);
    const mEnd = moment(endLocal);

    return {
        timeStartFormattedDate: mStart.format("YYYY-MM-DD"),
        timeStartFormattedTime: mStart.format("HH:mm:ss"),
        timeEndFormattedDate: mEnd.format("YYYY-MM-DD"),
        timeEndFormattedTime: mEnd.format("HH:mm:ss"),
    };
}

function getTimeframesForLastNHours(hours: number) {
    const now = new Date();
    const startLocal = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const endLocal = now;

    const mStart = moment(startLocal);
    const mEnd = moment(endLocal);

    return {
        timeStartFormattedDate: mStart.format("YYYY-MM-DD"),
        timeStartFormattedTime: mStart.format("HH:mm:ss"),
        timeEndFormattedDate: mEnd.format("YYYY-MM-DD"),
        timeEndFormattedTime: mEnd.format("HH:mm:ss"),
    };
}

function getTimeFromKeySegments(fileContent: string) {
    const startString = fileContent.match(CONSTANTS_REGEX.regexStartCompiled);
    const endString = fileContent.match(CONSTANTS_REGEX.regexEndCompiled);

    const datetimeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/;
    const startDateString = startString[0].match(datetimeRegex)[0];
    const endDateString = endString[0].match(datetimeRegex)[0];

    const startTimeObj = new Date(startDateString);
    const endTimeObj = new Date(endDateString);

    const mStart = moment(startTimeObj);
    const mEnd = moment(endTimeObj);

    if (
        mStart.format("YYYY-MM-DD") === "Invalid date" ||
        mEnd.format("YYYY-MM-DD") === "Invalid date"
    ) {
        new Notice(
            "Invalid date format. Please use 'YYYY-MM-DD HH:mm' format.",
            10000
        );
        return null;
    }

    return {
        timeStartFormattedDate: mStart.format("YYYY-MM-DD"),
        timeStartFormattedTime: mStart.format("HH:mm"),
        timeEndFormattedDate: mEnd.format("YYYY-MM-DD"),
        timeEndFormattedTime: mEnd.format("HH:mm"),
        startString,
        endString,
    };
}

function settingsCheck(settings: any) {
    if (
        settings.keywordSegmentStart === "" ||
        settings.keywordSegmentEnd === ""
    ) {
        new Notice(
            "No keyword segment set. Please set one in the settings.",
            10000
        );
        return false;
    }
    if (settings.authToken === "") {
        new Notice("No auth token set. Please set one in the settings.", 10000);
        return false;
    }
    return true;
}

function segmentsCheck(
    fileContent: string,
    settings: any,
    fetchStrategy: string
) {
    if (fetchStrategy === FETCH_STRATEGIES.fromFile) {
        const startString = fileContent.match(
            CONSTANTS_REGEX.regexStartCompiled
        );
        const endString = fileContent.match(CONSTANTS_REGEX.regexEndCompiled);

        if (startString === null || endString === null) {
            new Notice(
                `Keyword segment not found in current file. You are using templated segments. ` +
                    `\nPlease follow this format: \n${CONSTANTS_SEGMENTS.templatedSegmentStart} \n${CONSTANTS_SEGMENTS.templatedSegmentEnd}`,
                10000
            );
            return false;
        }
    }
    if (
        fetchStrategy === FETCH_STRATEGIES.today ||
        fetchStrategy === FETCH_STRATEGIES.lastNHours
    ) {
        if (
            !fileContent.includes(settings.keywordSegmentStart) ||
            !fileContent.includes(settings.keywordSegmentEnd)
        ) {
            new Notice(
                `Keyword segment not found in current file. ` +
                    `Please add: \n'${settings.keywordSegmentStart}' \nand \n'${settings.keywordSegmentEnd}' \nto the file.`,
                10000
            );
            return false;
        }
    }

    return true;
}

export {
    getTimeframesForUsersToday,
    getTimeframesForLastNHours,
    getTimeFromKeySegments,
    settingsCheck,
    segmentsCheck,
};
