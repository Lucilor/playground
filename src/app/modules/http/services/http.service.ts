import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {timer} from "@app/app.common";
import {environment} from "@env";
import {ObjectOf} from "@lucilor/utils";
import {MessageService} from "@modules/message/services/message.service";
import {lastValueFrom} from "rxjs";
import urljoin from "url-join";
import {CustomResponse, HttpOptions, HttpServiceResponseError} from "./http.service.types";

export const headerNoCache: HttpOptions = {headers: {"Cache-control": "no-cache"}};

@Injectable({
  providedIn: "root"
})
export class HttpService {
  loaderId = "master";
  protected message: MessageService;
  protected http: HttpClient;
  protected snackBar: MatSnackBar;
  baseURL = environment.host;
  lastResponse: CustomResponse<any> | null = null;

  constructor(injector: Injector) {
    this.message = injector.get(MessageService);
    this.http = injector.get(HttpClient);
    this.snackBar = injector.get(MatSnackBar);
  }

  protected alert(msg: string, silent: boolean) {
    if (!silent) {
      this.message.alert(msg);
    }
  }

  protected snack(msg: string, silent: boolean) {
    if (!silent) {
      this.message.snack(msg);
    }
  }

  protected error(msg: string, silent: boolean, title = "网络请求错误") {
    if (!silent) {
      this.message.error({content: msg, title: `<span style="color:red">${title}</span>`});
    }
  }

  async request<T>(url: string, method: "GET" | "POST", data?: any, options?: HttpOptions) {
    if (!url.startsWith("http")) {
      url = urljoin(this.baseURL, url);
    }
    const silent = !!options?.silent;
    const timerName = `http.request.${url}.${timer.now}`;
    timer.start(timerName);
    const rawUrl = url;
    if (!url.startsWith("http")) {
      url = `${this.baseURL}${url}`;
    }
    let response: CustomResponse<T> | null = null;
    try {
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
        response = await lastValueFrom(this.http.get<CustomResponse<T>>(url, options));
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
        response = await lastValueFrom(this.http.post<CustomResponse<T>>(url, data, options));
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
          throw new HttpServiceResponseError(response);
        }
      }
    } catch (error) {
      let content = "";
      if (error instanceof HttpErrorResponse) {
        const {error: err, status, statusText} = error;
        const text = err?.text;
        if (typeof err === "string") {
          content = err;
        } else if (typeof text === "string") {
          content = text;
        } else {
          content = "未知网络错误";
        }
        content = `<span>${status} (${statusText})</span><br>${content}`;
      } else if (error instanceof HttpServiceResponseError) {
        content = error.details || error.message;
      } else if (error instanceof Error) {
        content = error.message;
      }
      console.error(error);
      this.error(content, silent, response?.title);
      return response;
    } finally {
      this.lastResponse = response;
      if (response) {
        response.duration = timer.getDuration(timerName);
      }
      if (silent) {
        timer.end(timerName);
      } else {
        timer.end(timerName, `${method} ${rawUrl}`);
      }
    }
  }

  async get<T>(url: string, data?: ObjectOf<any>, options?: HttpOptions) {
    return await this.request<T>(url, "GET", data, options);
  }

  async post<T>(url: string, data?: ObjectOf<any>, options?: HttpOptions) {
    return await this.request<T>(url, "POST", data, options);
  }

  getResponseData<T>(response: CustomResponse<T> | null, ignoreCode?: boolean) {
    if (response && (ignoreCode || response.code === 0)) {
      return response.data || null;
    }
    return null;
  }
}
