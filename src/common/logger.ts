export const logger = (...message: unknown[]) => {
    console.log(`[LOG] ${message.join(' ')}`);
};
