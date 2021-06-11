import {LocalStorage, SessionStorage} from "@lucilor/utils";

export interface Response<T> {
    code: number;
    msg?: string;
    data?: T;
    count?: number;
    importance?: number;
}

export const routesInfo = {
    index: {path: "index", title: "首页"},
    bezier: {path: "bezier", title: "贝塞尔曲线"},
    rubiksCube: {path: "rubiks-cube", title: "魔方"},
    chinesePoetry: {path: "chinese-poetry", title: "古诗词"},
    chat: {path: "chat", title: "机器人茉莉"},
    bullsAndCows: {path: "bulls-and-cows", title: "猜数字"},
    blog: {path: "blog", title: "博客"},
    chineseChess: {path: "chinese-chess", title: "中国象棋", beta: true},
    neteaseMusic: {path: "wyyyy", title: "网易云音乐", beta: true}
};

export const session = new SessionStorage("playground");
export const local = new LocalStorage("playground");
