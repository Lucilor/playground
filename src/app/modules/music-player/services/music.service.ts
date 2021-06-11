import {Injectable, Injector} from "@angular/core";
import {ObjectOf} from "@lucilor/utils";
import {HttpService, headerNoCache} from "@modules/http/services/http.service";
import md5 from "md5";
import {BehaviorSubject} from "rxjs";
import {environment} from "src/environments/environment";

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

export interface Playlist {
    adType: number;
    anonimous: boolean;
    artists: null;
    backgroundCoverId: number;
    backgroundCoverUrl: string | null;
    cloudTrackCount: number;
    commentThreadId: string;
    coverImgId: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    coverImgId_str: string;
    coverImgUrl: string;
    createTime: number;
    creator: {
        defaultAvatar: boolean;
        province: number;
        authStatus: number;
        followed: boolean;
        avatarUrl: string;
    };
    description: string | null;
    englishTitle: string | null;
    highQuality: boolean;
    id: number;
    name: string;
    newImported: boolean;
    opRecommend: boolean;
    ordered: boolean;
    playCount: number;
    privacy: number;
    recommendInfo: null;
    sharedUsers: null;
    specialType: number;
    status: number;
    subscribed: boolean;
    subscribedCount: number;
    subscribers: [];
    tags: string[];
    titleImage: number;
    titleImageUrl: string | null;
    totalDuration: number;
    trackCount: number;
    trackNumberUpdateTime: number;
    trackUpdateTime: number;
    tracks: null;
    updateFrequency: null;
    updateTime: number;
    userId: number;
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
    playlist: Playlist2 | null = null;
    user$ = new BehaviorSubject<User | null>(null);

    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/netease-music`;
        this.refreshLoginStatus();
    }

    async getPlaylist(net_id: number) {
        const response = await this.get<PlaylistRaw[]>(`${environment.host}/api/playlist/${net_id}`);
        if (response?.data) {
            const data = response.data[0];
            data.content = JSON.parse(data.content);
            this.playlist = data as unknown as Playlist2;
            return this.playlist;
        }
        return null;
    }

    async setPlaylist(net_id: number, mode = "listloop") {
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
            offset
        });
        if (response?.data) {
            return response.data.playlist;
        }
        return [];
    }

    async getPlaylistDetail(id: string) {
        const response = await this.get<ObjectOf<any>>("playlist/detail", {id});
        if (response?.data) {
            return response.data.playlist as ObjectOf<any>;
        }
        return null;
    }
}
