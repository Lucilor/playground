import {FormGroup, FormControl, FormControlState, FormControlOptions, AbstractControlOptions} from "@angular/forms";
import {Router} from "@angular/router";
import {environment} from "@env";
import {SessionStorage, LocalStorage, ObjectOf} from "@lucilor/utils";

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
    chineseChess: {path: "chinese-chess", title: "中国象棋", beta: true} as RouteInfo,
    thuum: {path: "thuum", title: "Thuum"} as RouteInfo,
    // blog: {path: "https://candypurity.com/wordpress", title: "博客", isOuter: true} as RouteInfo,
    kod: {path: "https://candypurity.com/kod", title: "网盘", isOuter: true} as RouteInfo
};

export const navigate = (router: Router, routeInfo: RouteInfo) => {
    if (routeInfo.isOuter) {
        window.open(routeInfo.path);
    } else {
        router.navigate([routeInfo.path], {queryParamsHandling: "merge"});
    }
};

export const session = new SessionStorage("playground");
export const local = new LocalStorage("playground");

export type TypedFormGroup<T extends ObjectOf<any>> = FormGroup<{[K in keyof T]: FormControl<T[K]>}>;

export const getFormControl = <T>(value: T | FormControlState<T>, opts: FormControlOptions = {}) =>
    new FormControl(value, {...opts, nonNullable: true});

export const getFormGroup = <T extends ObjectOf<any>>(controls: {[K in keyof T]: FormControl<T[K]>}, opts?: AbstractControlOptions) =>
    new FormGroup(controls, opts);

export const setGlobal = <T>(key: string, value: T, production = false) => {
    if (!production && environment.production) {
        return;
    }
    (window as any)[key] = value;
    // Reflect.defineProperty(window, key, {value});
};

export const getFormControlErrorString = (control: FormControl) => {
    const errors = control.errors;
    if (!errors) {
        return null;
    }
    const mapFn = (str: string) => {
        switch (str) {
            case "required":
                return "必填";
            default:
                return str;
        }
    };
    return Object.keys(errors).map(mapFn).join(", ");
};
