import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {AppState} from "../store/state";
import {HttpService} from "./http.service";

export interface Poem {
	id: number;
	author: string;
	dynasty: string;
	title: string;
	rhythmic: string;
	chapter: string;
	paragraphs: string;
	notes: string;
	collection: string;
	section: string;
	content: string;
	comment: string;
	tags: string;
}

@Injectable({
	providedIn: "root"
})
export class ChinesePoetryService extends HttpService {
	constructor(dialog: MatDialog, store: Store<AppState>, http: HttpClient) {
		super(dialog, store, http);
	}

	async random(num = 1, collections: string[] = null) {
		const response = await this.request("random", "GET", {num, collections});
		if (response) {
			return response.data as Poem[];
		} else {
			return [];
		}
	}

	async search(poem: Partial<Poem>, page?: number, limit?: number) {
		const response = await this.request("search", "POST", {poem, page, limit});
		if (response) {
			return [response.data, response.count] as [Poem[], number];
		} else {
			return [[], -1] as [Poem[], number];
		}
	}
}
