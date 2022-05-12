import {LocalStorage, SessionStorage} from "@lucilor/utils";

export interface Response<T> {
    code: number;
    msg?: string;
    data?: T;
    count?: number;
    importance?: number;
}

export interface RouteInfo {
    path: string;
    title: string;
    hiddinInIndex?: boolean;
    beta?: boolean;
    isOuter?: boolean;
}

export const routesInfo = {
    index: {path: "index", title: "首页", hiddinInIndex: true} as RouteInfo,
    bezier: {path: "bezier", title: "贝塞尔曲线"} as RouteInfo,
    rubiksCube: {path: "rubiks-cube", title: "魔方"} as RouteInfo,
    chinesePoetry: {path: "chinese-poetry", title: "古诗词"} as RouteInfo,
    chat: {path: "chat", title: "机器人茉莉"} as RouteInfo,
    bullsAndCows: {path: "bulls-and-cows", title: "猜数字"} as RouteInfo,
    blog: {path: "blog", title: "博客"} as RouteInfo,
    chineseChess: {path: "chinese-chess", title: "中国象棋", beta: true} as RouteInfo,
    thuum: {path: "thuum", title: "Thuum"} as RouteInfo,
    kod: {path: "https://candypurity.com/kod", title: "网盘", isOuter: true} as RouteInfo
};

export const session = new SessionStorage("playground");
export const local = new LocalStorage("playground");
