import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Response} from "@app/app.common";
import {environment} from "@env";
import {ObjectOf} from "@lucilor/utils";
import {MessageService} from "@modules/message/services/message.service";
import {lastValueFrom} from "rxjs";
import urljoin from "url-join";

export const headerNoCache: HttpOptions = {headers: {"Cache-control": "no-cache"}};

/* eslint-disable @typescript-eslint/indent */
export interface HttpOptions {
    headers?:
        | HttpHeaders
        | {
              [header: string]: string | string[];
          };
    observe?: "body";
    params?:
        | HttpParams
        | {
              [param: string]: string | string[];
          };
    reportProgress?: boolean;
    responseType?: "json";
    withCredentials?: boolean;
    noStrict?: boolean;
}
/* eslint-enable @typescript-eslint/indent */

@Injectable({
    providedIn: "root"
})
export class HttpService {
    silent = false;
    loaderId = "master";
    message: MessageService;
    http: HttpClient;
    snackBar: MatSnackBar;
    baseURL = environment.host;

    constructor(injector: Injector) {
        this.message = injector.get(MessageService);
        this.http = injector.get(HttpClient);
        this.snackBar = injector.get(MatSnackBar);
    }

    protected alert(content: any) {
        if (!this.silent) {
            this.message.alert({content});
        }
    }

    async request<T>(url: string, method: "GET" | "POST", data?: any, options?: HttpOptions) {
        if (!url.startsWith("http")) {
            url = urljoin(this.baseURL, url);
        }
        try {
            let response: Response<T> | null = null;
            if (method === "GET") {
                if (data) {
                    const queryArr: string[] = [];
                    for (const key in data) {
                        if (data[key] !== undefined) {
                            queryArr.push(`${key}=${data[key]}`);
                        }
                    }
                    if (queryArr.length) {
                        url += `?${queryArr.join("&")}`;
                    }
                }
                response = await lastValueFrom(this.http.get<Response<T>>(url, options));
            }
            if (method === "POST") {
                if (Object.values(data).some((v) => v instanceof File)) {
                    const formData = new FormData();
                    for (const key in data) {
                        const value = data[key];
                        if (typeof value === "string") {
                            formData.append(key, value);
                        } else {
                            formData.append(key, JSON.stringify(value));
                        }
                    }
                    data = formData;
                }
                response = await lastValueFrom(this.http.post<Response<T>>(url, data, options));
            }
            if (!response) {
                throw new Error("请求错误");
            }
            if (options?.noStrict) {
                return response;
            } else {
                const code = response.code;
                if (code === 0) {
                    if (typeof response.msg === "string" && response.msg) {
                        this.message.snack(response.msg);
                    }
                    return response;
                } else {
                    throw new Error(response.msg);
                }
            }
        } catch (error) {
            this.alert(error);
            return null;
        }
    }

    async get<T>(url: string, data?: ObjectOf<any>, options?: HttpOptions) {
        return await this.request<T>(url, "GET", data, options);
    }

    async post<T>(url: string, data?: ObjectOf<any>, options?: HttpOptions) {
        return await this.request<T>(url, "POST", data, options);
    }
}
