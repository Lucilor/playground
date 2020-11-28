import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Response} from "@src/app/app.common";
import {AnyObject} from "@lucilor/utils";
import {MessageService} from "../../message/services/message.service";

@Injectable({
    providedIn: "root"
})
export class HttpService {
    silent = false;
    loaderId = "master";
    message: MessageService;
    http: HttpClient;
    snackBar: MatSnackBar;
    baseURL = "";

    constructor(injector: Injector) {
        this.message = injector.get(MessageService);
        this.http = injector.get(HttpClient);
        this.snackBar = injector.get(MatSnackBar);
    }

    protected alert(content: any) {
        if (!this.silent) {
            this.message.alert(content);
            console.log(content);
        }
    }

    async request<T>(url: string, method: "GET" | "POST", data?: AnyObject) {
        url = `${this.baseURL}/${url}`;
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
                    response = await this.http.get<Response<T>>(url).toPromise();
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
                    response = await this.http.post<Response<T>>(url, data).toPromise();
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
            if (response.code === 0) {
                if (typeof response.msg === "string" && response.msg && !this.silent) {
                    this.snackBar.open(response.msg);
                }
                return response;
            } else {
                throw new Error(response.msg);
            }
        } catch (error) {
            this.alert(error);
            return null;
        }
    }
}
