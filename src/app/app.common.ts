import {FormGroup, FormControl, FormControlState, FormControlOptions, AbstractControlOptions} from "@angular/forms";
import {Router} from "@angular/router";
import {environment} from "@env";
import {SessionStorage, LocalStorage, ObjectOf} from "@lucilor/utils";
import {RouteInfo} from "./app-routing.module";

export interface Response<T> {
    code: number;
    msg?: string;
    data?: T;
    count?: number;
    importance?: number;
}

export const navigate = (router: Router, routeInfo: RouteInfo) => {
    if (routeInfo.data?.isOuter) {
        window.open(routeInfo.redirectTo, "_blank");
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
