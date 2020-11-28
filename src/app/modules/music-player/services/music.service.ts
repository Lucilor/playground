import {Injectable, Injector} from "@angular/core";
import {AnyObject} from "@lucilor/utils";
import {local} from "@src/app/app.common";
import {environment} from "@src/environments/environment";
import * as md5 from "md5";
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
        experts: {};
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
    playlist: Playlist | null = null;
    playlistChange = new BehaviorSubject<Playlist | null>(null);
    user: User | null = null;
    userChange = new BehaviorSubject<User | null>(null);

    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/static/playlist`;
        this.playlistChange.subscribe((playlist) => (this.playlist = playlist));
        this.userChange.subscribe((user) => (this.user = user));

        const id = local.load("playlistId") || "74222476";
        this.setPlaylist(id);

        this.refreshLoginStatus();
    }

    private _setBaseURL(type: 1 | 2) {
        if (type === 1) {
            this.baseURL = `${environment.host}/netease-music-api`;
        } else {
            this.baseURL = `${environment.host}/static/playlist`;
        }
    }

    async setPlaylist(id: string) {
        this._setBaseURL(2);
        const response = await this.request<Playlist>("get.php", "GET", {id});
        if (response?.data) {
            this.playlistChange.next(response.data);
            local.save("playlistId", id);
            return this.playlist;
        }
        return null;
    }

    async updatePlaylist(id: string) {
        this._setBaseURL(2);
        await this.request<Playlist>("set.php", "GET", {id});
    }

    async login(user: string, password: string, isEmail: boolean) {
        this._setBaseURL(1);
        let url = "";
        const data: AnyObject = {md5_password: md5(password)};
        if (isEmail) {
            url = "login";
            data.email = user;
        } else {
            url = "login/cellphone";
            data.phone = user;
        }
        const response = await this.request<User>(url, "GET", data);
        if (response?.data) {
            this.refreshLoginStatus();
        }
    }

    async refreshLoginStatus() {
        this._setBaseURL(1);
        const silent = this.silent;
        this.silent = true;
        await this.request<User>("login/refresh", "GET");
        const response = await this.request<User>("login/status", "GET");
        if (response?.data) {
            const response2 = await this.request<User>("user/detail", "GET", {uid: response.data.profile.userId});
            if (response2?.data) {
                this.userChange.next(response2.data);
                return;
            }
        }
        this.userChange.next(null);
        this.silent = silent;
    }

    async logout() {
        this._setBaseURL(1);
        await this.request<User>("logout", "GET");
        await this.request<User>("login/refresh", "GET");
        this.userChange.next(null);
    }
}
