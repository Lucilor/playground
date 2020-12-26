import {LocalStorage, ObjectOf, SessionStorage} from "@lucilor/utils";

export interface Response<T> {
    code: number;
    msg?: string;
    data?: T;
    count?: number;
    importance?: number;
}

export const routesInfo: ObjectOf<{path: string; title: string}> = {
    index: {path: "index", title: "首页"},
    bezier: {path: "bezier", title: "贝塞尔曲线"},
    rubiksCube: {path: "rubiks-cube", title: "魔方"},
    chinesePoetry: {path: "chinese-poetry", title: "古诗词"},
    neteaseMusic: {path: "wyyyy", title: "更换歌单"},
    chat: {path: "chat", title: "机器人茉莉"},
    bullsAndCows: {path: "bulls-and-cows", title: "猜数字"},
    blog: {path: "blog", title: "博客"},
    chineseChess: {path: "chinese-chess", title: "中国象棋"}
};

export const session = new SessionStorage("playground");
export const local = new LocalStorage("playground");
