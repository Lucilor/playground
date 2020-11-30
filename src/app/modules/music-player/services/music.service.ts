import {Injectable, Injector} from "@angular/core";
import {AnyObject} from "@lucilor/utils";
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
        const response = await this.request<Playlist>(`${environment.host}/static/playlist/get.php`, "GET", {id});
        if (response?.data) {
            this.playlist = response.data;
            return response.data;
        }
        return null;
    }

    async setPlaylist(id: string, mode = "listloop") {
        await this.request<Playlist>(`${environment.host}/static/playlist/set.php`, "GET", {id, mode});
    }

    async login(user: string, password: string, isEmail: boolean) {
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
        const silent = this.silent;
        this.silent = true;
        await this.request<User>("login/refresh", "GET");
        const response = await this.request<User>("login/status", "GET");
        if (response?.data) {
            const response2 = await this.request<User>("user/detail", "GET", {uid: response.data.profile.userId});
            if (response2?.data) {
                response2.data.profile.avatarUrl = response2.data.profile.avatarUrl.replace(/^http:/, "https:");
                response2.data.profile.backgroundUrl = response2.data.profile.backgroundUrl.replace(/^http:/, "https:");
                this.userChange.next(response2.data);
                return;
            }
        }
        this.userChange.next(null);
        this.silent = silent;
    }

    async logout() {
        await this.request<User>("logout", "GET");
        await this.request<User>("login/refresh", "GET");
        this.userChange.next(null);
    }

    async getPlaylistCount() {
        const response = await this.request<any>("user/subcount", "GET");
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
        const response = await this.request<AnyObject>("user/playlist", "GET", {uid: this.user.profile.userId, offset});
        if (response?.data) {
            return response.data.playlist as AnyObject[];
        }
        return [];
    }

    async getPlaylistDetail(id: string) {
        const response = await this.request<AnyObject>("playlist/detail", "GET", {id});
        if (response?.data) {
            return response.data.playlist as AnyObject;
        }
        return null;
    }
}
