import {Injectable, Injector} from "@angular/core";
import {environment} from "@src/environments/environment";
import {HttpService} from "./http.service";

export interface Poem {
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
    constructor(injector: Injector) {
        super(injector);
        this.baseURL = `${environment.host}/chinese-poetry-api`;
    }

    async random(num = 1, collections: string[] | null = null) {
        const response = await this.get("random", {num, collections});
        if (response) {
            return response.data as Poem[];
        } else {
            return [];
        }
    }

    async search(poem: Partial<Poem>, page?: number, limit?: number) {
        const response = await this.post("search", {poem, page, limit});
        if (response) {
            return [response.data, response.count] as [Poem[], number];
        } else {
            return [[], -1] as [Poem[], number];
        }
    }
}
