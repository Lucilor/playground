import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {Response} from "@src/app/app.common";
import {AnyObject} from "@lucilor/utils";
import {MessageService} from "../../message/services/message.service";

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
}

@Injectable({
    providedIn: "root"
})
export class HttpService {
    silent = false;
    loaderId = "master";
    message: MessageService;
    http: HttpClient;
    baseURL = "";

    constructor(injector: Injector) {
        this.message = injector.get(MessageService);
        this.http = injector.get(HttpClient);
    }

    protected alert(content: any) {
        if (!this.silent) {
            this.message.alert(content);
            console.log(content);
        }
    }

    private async request<T>(url: string, method: "GET" | "POST", data?: AnyObject, options?: HttpOptions) {
        if (!url.startsWith("http")) {
            url = `${this.baseURL}/${url}`;
        }
        try {
            let response: Response<T> | null = null;
            if (method === "GET") {
                if (data) {
                    const queryArr: string[] = [];
                    for (const key in data) {
                        queryArr.push(`${key}=${data[key]}`);
                    }
                    if (queryArr.length) {
                        url += `?${queryArr.join("&")}`;
                    }
                }
                try {
                    response = await this.http.get<Response<T>>(url, options).toPromise();
                } catch (error) {
                    if (error instanceof HttpErrorResponse && typeof error.error === "object") {
                        response = error.error;
                    } else {
                        throw new Error(error);
                    }
                }
            }
            if (method === "POST") {
                try {
                    response = await this.http.post<Response<T>>(url, data, options).toPromise();
                } catch (error) {
                    if (error instanceof HttpErrorResponse && typeof error.error === "object") {
                        response = error.error;
                    } else {
                        throw new Error(error);
                    }
                }
            }
            if (!response) {
                throw new Error("请求错误");
            }
            if (typeof response.msg === "string" && response.msg && !this.silent) {
                this.message.snack(response.msg);
            }
            return response;
        } catch (error) {
            this.alert(error);
            return null;
        }
    }

    async get<T>(url: string, data?: AnyObject, options?: HttpOptions) {
        return await this.request<T>(url, "GET", data, options);
    }

    async post<T>(url: string, data?: AnyObject, options?: HttpOptions) {
        return await this.request<T>(url, "POST", data, options);
    }
}
