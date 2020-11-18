import {Injectable, Injector} from "@angular/core";
import {environment} from "@src/environments/environment";
import {HttpService} from "./http.service";

export interface Lyric {
    lyricUser: {
        id: number;
        status: number;
        demand: number;
        userid: number;
        nickname: string;
        uptime: number;
    };
    lrc: {
        version: number;
        lyric: string;
    };
    klyric: {
        version: number;
        lyric: string;
    };
    tlyric: {
        version: number;
        lyric: string;
    };
}

export interface Song {
    id: number;
    name: string;
    ar: {
        id: number;
        name: string;
        tns: string[];
        alias: string[];
        alia: string[];
        al: {
            id: number;
            name: string;
            picUrl: string;
            tns: string[];
            pic_str: string;
            pic: number;
        };
    }[];
    url: string;
    lyric?: Lyric;
}

export interface Playlist {
    id: number;
    name: string;
    coverImg: string;
    songs: Song[];
}

@Injectable({
    providedIn: "root"
})
export class NeteaseMusicService extends HttpService {
    constructor(inejctor: Injector) {
        super(inejctor);
        this.baseURL = `${environment.host}/netease-music-api`;
        this.strict = false;
    }

    // login(user: string, password: string) {}

    async getPlayList(id: string) {
        const response = (await this.request("playlist/detail", "GET", {id})) as any;
        if (response) {
            const playlist: Playlist = {
                id: response.playlist.id,
                name: response.playlist.name,
                coverImg: response.playlist.coverImgUrl,
                songs: []
            };
            const songIds = response.playlist.trackIds as {id: string}[];
            for (const v of songIds) {
                const response2 = (await this.request("song/detail", "GET", {ids: v.id})) as any;
                if (response2) {
                    const song = response2.songs[0];
                    playlist.songs.push({
                        id: song.id,
                        name: song.name,
                        ar: song.ar,
                        url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`
                    });
                }
            }
            return playlist;
        }
        return null;
    }

    async getSongs(ids: string[]) {
        const response = (await this.request("playlist/detail", "GET", {ids: ids.join(",")})) as any;
        if (response) {
            return response.playlist as Playlist;
        }
        return null;
    }
}
