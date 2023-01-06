import {Injectable, Injector} from "@angular/core";
import {environment} from "@env";
import urljoin from "url-join";
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
    this.baseURL = urljoin(environment.host, "api/chinese-poetry");
  }

  async random(num = 10) {
    const response = await this.get("random", {num});
    if (response) {
      return response.data as Poem[];
    } else {
      return [];
    }
  }

  async search(poem: Partial<Poem>, skip?: number, take?: number) {
    const response = await this.post("search", {poem, skip, take});
    if (response) {
      return [response.data, response.count] as [Poem[], number];
    } else {
      return [[], -1] as [Poem[], number];
    }
  }
}
