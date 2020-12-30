export const chineseChessBoardSize = {width: 8, height: 9};
const {width, height} = chineseChessBoardSize;

export const switchPosition = (position: number[]) => [width - position[0], height - position[1]];
export const isPositionInPath = (position: number[], path: number[][]) => !!path.find((p) => p[0] === position[0] && p[1] === position[1]);

export const getLeftUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[0] - maxStep : 0;
    for (let i = position[0] - 1; i >= j; i--) {
        const p = [i, position[1]];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
export const getRightUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[0] + maxStep : width;
    for (let i = position[0] + 1; i <= j; i++) {
        const p = [i, position[1]];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
export const getUpUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[1] + maxStep : height;
    for (let i = position[1] + 1; i <= j; i++) {
        const p = [position[0], i];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
export const getDownUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[1] - maxStep : 0;
    for (let i = position[1] - 1; i >= j; i--) {
        const p = [position[0], i];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
