import {HttpClient} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {host, Response} from "../app.common";
import {openMessageDialog} from "../components/message/message.component";

@Injectable({
	providedIn: "root"
})
export class HttpService {
	silent = false;
	loaderId = "master";
	dialog: MatDialog;
	http: HttpClient;
	apiUrl = "";
	strict = true;

	constructor(injector: Injector) {
		this.dialog = injector.get(MatDialog);
		this.http = injector.get(HttpClient);
	}

	protected alert(content: any) {
		if (!this.silent) {
			openMessageDialog(this.dialog, {data: {type: "alert", content}});
			console.log(content);
		}
	}

	async request(url: string, method: "GET" | "POST", data?: {[key: string]: any}) {
		url = `${host}/${this.apiUrl}/${url}`;
		try {
			let response: Response;
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
				response = await this.http.get<Response>(url).toPromise();
			}
			if (method === "POST") {
				let files: File[];
				for (const key in data) {
					const value = data[key];
					if (value instanceof FileList) {
						files = Array.from(value);
						delete data[key];
					}
					if (value instanceof File) {
						files = [value];
						delete data[key];
					}
				}
				response = await this.http.post<Response>(url, data).toPromise();
			}
			if (!response) {
				throw new Error("请求错误");
			}
			if (this.strict) {
				if (response.code === 0) {
					return response;
				} else {
					throw new Error(response.msg);
				}
			} else {
				return response;
			}
		} catch (error) {
			this.alert(error);
			return null;
		}
	}
}
