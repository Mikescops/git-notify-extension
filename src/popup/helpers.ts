export const calculateTimeElapsed = (date: number) => {
    const startStamp = new Date(date).getTime();
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
