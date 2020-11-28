import {Injectable, Injector} from "@angular/core";
import {local} from "@src/app/app.common";
import {environment} from "@src/environments/environment";
import {BehaviorSubject} from "rxjs";
import {HttpService} from "../../http/services/http.service";

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
export class MusicService extends HttpService {
    playlist: Playlist | null = null;
    playlistChange = new BehaviorSubject<Playlist | null>(null);

    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/static/playlist`;
        this.strict = false;

        const id = local.load("playlistId") || "74222476";
        this.setPlaylist(id);
    }

    async setPlaylist(id: string) {
        const response = await this.request<Playlist>("get.php", "GET", {id});
        if (response?.data) {
            this.playlist = response.data;
            this.playlistChange.next(this.playlist);
            local.save("playlistId", id);
            return this.playlist;
        }
        return null;
    }

    async updatePlaylist(id: string) {
        await this.request<Playlist>("set.php", "GET", {id});
    }
}
