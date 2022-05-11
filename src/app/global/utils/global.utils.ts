export const sleep = (time: number = 0): Promise<void> => {
    return new Promise(resolve => {
        let task = setTimeout(() => {
            clearTimeout(task);
            resolve();
        }, time);
    });
}
