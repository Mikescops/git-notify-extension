export const calculateTimeElapsed = (timestamp: number | string) => {
    const startStamp = new Date(timestamp).getTime();
    const newDate = new Date();
    const newStamp = newDate.getTime();
    let diff = Math.round((newStamp - startStamp) / 1000);

    const d = Math.floor(diff / (24 * 60 * 60));
    diff = diff - d * 24 * 60 * 60;
    const h = Math.floor(diff / (60 * 60));
    diff = diff - h * 60 * 60;
    const m = Math.ceil(diff / 60);

    if (d >= 1) {
        return `${d}d ${h}h`;
    }
    if (h >= 1) {
        return `${h}h ${m}min`;
    }
    return `${m} minutes`;
};

export const getHumanReadableDate = (timestamp: number) => {
    return new Date(timestamp).toUTCString();
};

export const removeDuplicateObjectFromArray = <T>(array: T[], key: string): T[] => {
    return array.filter(
        (obj, index, self) =>
            index ===
            self.findIndex(
                (element) =>
                    (element as { [index: string]: unknown })[key] === (obj as { [index: string]: unknown })[key]
            )
    );
};

export const cleanupDescription = (description: string) => {
    if (!description || typeof description !== 'string' || description === '') {
        return '';
    }
    return description
        .replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\n{2,}/g, '\n\n')
        .trim();
};
