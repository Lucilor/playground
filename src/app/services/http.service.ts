import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {host, Response} from "../app.common";
import {openMessageDialog} from "../components/message/message.component";
import {LoadingAction} from "../store/actions";
import {AppState} from "../store/state";

@Injectable({
	providedIn: "root"
})
export class HttpService {
	silent = false;

	constructor(private dialog: MatDialog, private store: Store<AppState>, private http: HttpClient) {}

	private alert(content: any) {
		if (!this.silent) {
			openMessageDialog(this.dialog, {data: {type: "alert", content}});
		}
	}

	async request(url: string, method: "GET" | "POST", data?: {[key: string]: any}) {
		const name = url;
		this.store.dispatch<LoadingAction>({type: "add loading", name});
		url = `${host}/${url}`;
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
				const formData = new FormData();
				if (data) {
					for (const key in data) {
						formData.append(key, data[key]);
					}
				}
				if (files) {
					files.forEach((v, i) => formData.append("file" + i, v));
				}
				response = await this.http.post<Response>(url, formData).toPromise();
			}
			if (!response) {
				throw new Error("服务器无响应");
			}
			if (response.code === 0) {
				return response;
			} else {
				throw new Error(response.msg);
			}
		} catch (error) {
			this.alert(error);
			return null;
		} finally {
			this.store.dispatch<LoadingAction>({type: "remove loading", name});
		}
	}
}
