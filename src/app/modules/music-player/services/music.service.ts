import {Injectable, Injector} from "@angular/core";
import {ObjectOf} from "@lucilor/utils";
import {environment} from "@src/environments/environment";
import * as md5 from "md5";
import {BehaviorSubject} from "rxjs";
import {headerNoCache, HttpService} from "../../http/services/http.service";

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

export interface User {
    bindings: {
        bindingTime: number;
        expired: boolean;
        expiresIn: number;
        id: number;
        refreshTime: number;
        tokenJsonStr: {countrycode: string; cellphone: string; hasPassword: boolean};
        type: number;
        url: string;
        userId: number;
    }[];
    profile: {
        avatarUrl: string;
        backgroundImgId: number;
        backgroundImgIdStr: string;
        backgroundUrl: string;
        birthday: number;
        city: number;
        defaultAvatar: boolean;
        description: string;
        detailDescription: string;
        djStatus: number;
        eventCount: number;
        expertTags: string | null;
        experts: ObjectOf<any>;
        followed: boolean;
        followeds: number;
        follows: number;
        gender: number;
        mutual: boolean;
        nickname: string;
        playlistBeSubscribedCount: number;
        playlistCount: number;
        province: number;
        remarkName: string | null;
        signature: string;
        userId: number;
        userType: number;
        vipType: number;
    };
}

@Injectable({
    providedIn: "root"
})
export class MusicService extends HttpService {
    playlistId = new BehaviorSubject<string>("");
    playlist: Playlist | null = null;
    user: User | null = null;
    userChange = new BehaviorSubject<User | null>(null);

    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/netease-music-api`;
        this.userChange.subscribe((user) => (this.user = user));
        this.refreshLoginStatus();
    }

    async getPlaylist(id: string) {
        const response = await this.get<Playlist>(`${environment.host}/static/playlist/get.php`, {id});
        if (response?.data) {
            this.playlist = response.data;
            return response.data;
        }
        return null;
    }

    async setPlaylist(id: string, mode = "listloop") {
        await this.get<Playlist>(`${environment.host}/static/playlist/set.php`, {id, mode});
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
                forceSSL(response2.data.profile, ["avatarUrl", "backgroundUrl"]);
                this.userChange.next(response2.data);
                return;
            }
        }
        this.userChange.next(null);
        this.silent = silent;
    }

    async logout() {
        await this.get<User>("logout", {}, headerNoCache);
        this.userChange.next(null);
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
    async getPlaylists(page: number) {
        if (!this.user) {
            return [];
        }
        const offset = (page - 1) * 30;
        const response = await this.get<ObjectOf<any>>("user/playlist", {uid: this.user.profile.userId, offset});
        if (response?.data) {
            return response.data.playlist as ObjectOf<any>[];
        }
        return [];
    }

    async getPlaylistDetail(id: string) {
        const response = await this.get<ObjectOf<any>>("playlist/detail", {id});
        if (response?.data) {
            const playlist = response.data.playlist;
            forceSSL(playlist, "coverImgUrl");
            (playlist.tracks as ObjectOf<any>[]).forEach((v) => forceSSL(v.al, "picUrl"));
            return response.data.playlist as ObjectOf<any>;
        }
        return null;
    }
}

const forceSSL = (obj: ObjectOf<any>, keys: string[] | string) => {
    if (typeof keys === "string") {
        keys = [keys];
    }
    keys.forEach((key) => {
        const value = obj[key];
        if (typeof value === "string") {
            obj[key] = value.replace(/^http:/, "https:");
        }
    });
};
