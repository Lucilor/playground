import {Injectable, Injector} from "@angular/core";
import {ObjectOf} from "@lucilor/utils";
import {HttpService, headerNoCache} from "@modules/http/services/http.service";
import md5 from "md5";
import {BehaviorSubject} from "rxjs";
import {environment} from "src/environments/environment";
import {Playlist, PlaylistDetail, User} from "./netease-music.types";

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

export interface PlaylistRaw {
    id: string;
    name: string;
    mode: string;
    cover: string;
    content: string;
}

export interface Playlist2 extends Omit<PlaylistRaw, "content"> {
    content: Song[];
}

@Injectable({
    providedIn: "root"
})
export class MusicService extends HttpService {
    playlistId = new BehaviorSubject<string>("");
    playlist: Playlist2 | null = null;
    user$ = new BehaviorSubject<User | null>(null);

    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/netease-music`;
        this.refreshLoginStatus();
    }

    async getPlaylist2(net_id: number) {
        const response = await this.get<PlaylistRaw[]>(`${environment.host}/api/playlist/${net_id}`);
        if (response?.data) {
            const data = response.data[0];
            data.content = JSON.parse(data.content);
            this.playlist = data as unknown as Playlist2;
            return this.playlist;
        }
        return null;
    }

    async setPlaylist2(net_id: number, mode = "listloop") {
        await this.post<Playlist2>(`${environment.host}/api/playlist`, {net_id, mode});
    }

    async login(user: string, password: string, isEmail: boolean) {
        let url = "";
        const data: ObjectOf<any> = {md5_password: md5(password)};
        if (isEmail) {
            url = "login";
            data.email = user;
        } else {
            url = "login/cellphone";
            data.phone = user;
        }
        const response = await this.post<User>(url, data);
        if (response?.data) {
            this.refreshLoginStatus();
        }
    }

    async refreshLoginStatus() {
        const silent = this.silent;
        this.silent = true;
        const response = await this.get<User>("login/status", {}, headerNoCache);
        const uid = response?.data?.profile?.userId;
        if (uid) {
            const response2 = await this.get<User>("user/detail", {uid}, headerNoCache);
            if (response2?.data) {
                this.user$.next(response2.data);
                return;
            }
        }
        this.user$.next(null);
        this.silent = silent;
    }

    async logout() {
        await this.get<User>("logout", {}, headerNoCache);
        this.user$.next(null);
    }

    async getPlaylistCount() {
        const response = await this.get<any>("user/subcount");
        if (response?.data) {
            const {createdPlaylistCount, subPlaylistCount} = response.data;
            return (createdPlaylistCount + subPlaylistCount) as number;
        }
        return NaN;
    }

    // 30 items per page
    async getPlaylists(page: number, limit: number) {
        const user = this.user$.value;
        if (!user) {
            return [];
        }
        const offset = (page - 1) * limit;
        const response = await this.get<{more: boolean; playlist: Playlist[]; version: string}>("user/playlist", {
            uid: user.profile.userId,
            limit,
            offset,
            cookie: 1
        });
        if (response?.data) {
            return response.data.playlist;
        }
        return [];
    }

    async getPlaylistDetail(id: number) {
        const response = await this.get<{playlist: PlaylistDetail}>("playlist/detail", {id});
        if (response?.data) {
            return response.data.playlist;
        }
        return null;
    }

    async getTrack(id: number) {}
}
