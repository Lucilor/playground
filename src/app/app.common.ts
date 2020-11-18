export interface Response<T> {
    code: number;
    msg?: string;
    data?: T;
    count?: number;
    importance?: number;
}

export const paths = {
    index: "index",
    bezier: "bezier",
    "rubiks-cube": "rubiks-cube",
    "chinese-poetry": "chinese-poetry"
};
