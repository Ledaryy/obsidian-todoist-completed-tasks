export const CONSTANTS_SEGMENTS = {
    templatedSegmentStart: "%% TCT_TEMPLATED_START 1999-12-01 00:00 %%",
    templatedSegmentEnd: "%% TCT_TEMPLATED_END 2022-04-28 23:59 %%",
};

export const CONSTANTS_REGEX = {
    regexStartCompiled: new RegExp(
        `(${CONSTANTS_SEGMENTS.templatedSegmentStart.slice(0, 22)})` +
            "+( \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2} )+" +
            `(${CONSTANTS_SEGMENTS.templatedSegmentStart.slice(0, 2)})`,
        "g"
    ),
    regexEndCompiled: new RegExp(
        `(${CONSTANTS_SEGMENTS.templatedSegmentEnd.slice(0, 20)})` +
            "+( \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2} )+" +
            `(${CONSTANTS_SEGMENTS.templatedSegmentEnd.slice(0, 2)})`,
        "g"
    ),
};

export const FETCH_STRATEGIES = {
    today: "today",
    lastNHours: "lastNHours",
    fromFile: "fromFile",
};
