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
    rubiksCube: "rubiks-cube",
    chinesePoetry: "chinese-poetry",
    neteaseMusic: "wyyyy",
    chat: "chat"
};

export const session = new SessionStorage("playground");
export const local = new LocalStorage("playground");
