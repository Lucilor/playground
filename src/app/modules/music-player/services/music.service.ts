import {Injectable, Injector} from "@angular/core";
import {environment} from "@env";
import {ObjectOf} from "@lucilor/utils";
import {HttpService} from "@modules/http/services/http.service";
import md5 from "md5";
import {BehaviorSubject} from "rxjs";
import urljoin from "url-join";
import {User, Playlist, PlaylistDetail, Track, Lyric} from "./netease-music.types";

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
  content: Song[];
}

export type PlaylistMode = "listloop" | "singlecycle" | "listrandom";

export const playlistModeNames: Record<PlaylistMode, string> = {
  listloop: "列表循环",
  singlecycle: "单曲循环",
  listrandom: "列表随机"
};

@Injectable({
  providedIn: "root"
})
export class MusicService extends HttpService {
  playlistId$ = new BehaviorSubject<string>("");
  playlist$ = new BehaviorSubject<PlaylistRaw | null>(null);
  user$ = new BehaviorSubject<User | null>(null);
  baseURL = urljoin(environment.host, "netease-music");

  constructor(inejctor: Injector) {
    super(inejctor);
  }

  private _addTimestamp(obj: ObjectOf<any>) {
    obj.timestamp = new Date().getTime();
    return obj;
  }

  async getPlaylistRaw(id: string) {
    const response = await this.get<PlaylistRaw>(`${environment.host}/api/playlist/${id}`);
    if (response?.data) {
      this.playlist$.next(response.data);
      return this.playlist$.value;
    }
    return null;
  }

  async setPlaylistRaw(id: string, mode: string) {
    const response = await this.post<PlaylistRaw>(`${environment.host}/api/playlist`, {id, mode});
    return response?.code === 0;
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
    const response = await this.get<User>(url, this._addTimestamp(data));
    if (response?.data) {
      this.user$.next(response.data);
    }
  }

  async refreshLoginStatus() {
    const silent = this.silent;
    this.silent = true;
    const response = await this.get<User>("login/status", this._addTimestamp({}));
    const uid = response?.data?.profile?.userId;
    let user: User | null = null;
    if (uid) {
      const response2 = await this.get<User>("user/detail", this._addTimestamp({uid}));
      if (response2?.data) {
        user = response2.data;
      }
    }
    this.user$.next(user);
    this.silent = silent;
  }

  async logout() {
    await this.get<User>("logout", {});
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

  async getTracks(ids: number[]) {
    const response = await this.get<{songs: Track[]}>("song/detail", {ids: ids.join(",")});
    if (response?.data) {
      return response.data.songs;
    }
    return null;
  }

  async getLyric(id: number) {
    const response = await this.get<Lyric>("lyric", {id});
    if (response?.data) {
      return response.data;
    }
    return null;
  }
}
