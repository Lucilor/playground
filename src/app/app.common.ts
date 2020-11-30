import {LocalStorage, SessionStorage} from "@lucilor/utils";

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
    "chinese-poetry": "chinese-poetry",
    "netease-music": "wyyyy"
};

export const session = new SessionStorage("playground");
export const local = new LocalStorage("playground");
