import {Injectable, Injector} from "@angular/core";
import {environment} from "@src/environments/environment";
import {HttpService} from "./http.service";

export interface Song {
    id: string;
    src: string;
    poster: string;
    name: string;
    artist: string;
    album: string;
    lyric: string;
    sublyric: string;
}

export interface Playlist {
    id: string;
    name: string;
    mode: string;
    cover: string;
    content: Song[];
}

@Injectable({
    providedIn: "root"
})
export class NeteaseMusicService extends HttpService {
    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/static/playlist`;
        this.strict = false;
    }

    // login(user: string, password: string) {}

    async getPlayList(id: string) {
        const response = await this.request<Playlist>("get.php", "GET", {id});
        if (response && typeof response === "object") {
            return response.data;
        }
        return null;
    }
}
