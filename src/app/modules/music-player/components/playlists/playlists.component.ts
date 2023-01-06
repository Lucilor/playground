import {Component, Input, OnInit, ViewChild} from "@angular/core";
import {MatSelectionListChange} from "@angular/material/list";
import {MatMenuTrigger} from "@angular/material/menu";
import {keysOf, timeout} from "@lucilor/utils";
import {ContextMenu} from "@mixins/context-menu.mixin";
import {MessageService} from "@modules/message/services/message.service";
import {MusicService, playlistModeNames} from "@modules/music-player/services/music.service";
import {Playlist, PlaylistDetail, Track} from "@modules/music-player/services/netease-music.types";
import {SpinnerService} from "@modules/spinner/services/spinner.service";
import Color from "color";
import {decodeLyricStr, Lyric} from "cplayer/lib/lyric";
import {Properties} from "csstype";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: "app-playlists",
  templateUrl: "./playlists.component.html",
  styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent extends ContextMenu() implements OnInit {
  @Input() mainColor = new Color("white");
  limit = 10;
  playlistsPage = 0;
  playlistsMaxPage = -1;
  tracksPage = 0;
  tracksMaxPage = 0;
  playlists: Playlist[] = [];
  playlist: PlaylistDetail | null = null;
  allTracks: Track[] = [];
  track: Track | null = null;
  lyric: Lyric | null = null;
  tlyric: Lyric | null = null;
  loaderId = "music-player-playlists";
  loading = false;
  level$ = new BehaviorSubject<number>(0);
  get containerStyle(): Partial<Properties> {
    return {color: this.mainColor.isLight() ? "black" : "white"};
  }
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuData = {playlistId: -1};

  constructor(private music: MusicService, private spinner: SpinnerService, private message: MessageService) {
    super();
  }

  async ngOnInit() {
    this.level$.subscribe(async (level) => {
      if (level === 0) {
        if (this.playlistsMaxPage < 0) {
          this.playlistsMaxPage = this._getMaxPage(await this.music.getPlaylistCount());
          this.playlistsPage = 0;
          await this.playlistsNextPage();
        }
      } else if (level === 1) {
        if (!this.playlist) {
          this.level$.next(0);
        }
      } else if (level === 2) {
        if (!this.track) {
          this.level$.next(1);
        }
      }
    });
  }

  private _getMaxPage(total: number) {
    return Math.ceil(total / this.limit);
  }

  async playlistsNextPage() {
    if (this.playlistsPage > this.playlistsMaxPage || this.loading) {
      return;
    }
    this.playlistsPage++;
    const {limit, playlistsPage} = this;
    this.loading = true;
    const playlists = await this.music.getPlaylists(playlistsPage, limit);
    playlists.forEach((playlist) => this.playlists.push(playlist));
    this.loading = false;
  }

  tracksNextPage() {
    this.tracksPage++;
    const {limit, tracksPage, playlist} = this;
    if (this.tracksPage > this.tracksMaxPage || !playlist) {
      return;
    }
    playlist.tracks = this.allTracks.slice(0, tracksPage * limit);
  }

  async onScroll() {
    switch (this.level$.value) {
      case 0:
        await this.playlistsNextPage();
        break;
      case 1:
        this.tracksNextPage();
        break;
      default:
        break;
    }
  }

  async selectPlaylist(event: MatSelectionListChange | Playlist["id"]) {
    let id: Playlist["id"] | null;
    if (event instanceof MatSelectionListChange) {
      id = event.options[0].value;
    } else {
      id = event;
    }
    if (id === null) {
      return;
    }
    this.spinner.show(this.loaderId);
    const playlist = await this.music.getPlaylistDetail(id);
    this.playlist = playlist;
    this.spinner.hide(this.loaderId);
    await timeout(0);
    this.level$.next(1);
    this.allTracks = playlist ? playlist.tracks : [];
    this.tracksMaxPage = this._getMaxPage(this.allTracks.length);
    this.tracksPage = 0;
    this.tracksNextPage();
  }

  getTrackSubtitle(track: Track) {
    const ar = track.ar.map((v) => v.name).join(", ");
    return `${ar} - ${track.al.name}`;
  }

  async selectTrack(event: MatSelectionListChange | Track["id"]) {
    let id: Track["id"] | null;
    if (event instanceof MatSelectionListChange) {
      id = event.options[0].value;
    } else {
      id = event;
    }
    if (id === null) {
      return;
    }
    this.spinner.show(this.loaderId);
    const tracks = await this.music.getTracks([id]);
    if (tracks) {
      this.track = tracks[0];
      const lyric = await this.music.getLyric(id);
      if (lyric) {
        if (lyric.lrc) {
          this.lyric = decodeLyricStr(lyric.lrc.lyric);
        } else {
          this.lyric = null;
        }
        if (lyric.tlyric) {
          this.tlyric = decodeLyricStr(lyric.tlyric.lyric);
        } else {
          this.tlyric = null;
        }
      }
    }
    this.spinner.hide(this.loaderId);
    await timeout(0);
    this.level$.next(2);
  }

  back() {
    this.level$.next(this.level$.value - 1);
  }

  onContextMenu(event: MouseEvent, ...args: any[]): void {
    super.onContextMenu(event, ...args);
    this.contextMenuData.playlistId = args[1];
  }

  async setAsCurrentPlaylist() {
    const mode = await this.message.prompt({
      type: "select",
      label: "请选择播放模式",
      value: this.music.playlist$.value?.mode,
      options: keysOf(playlistModeNames).map((v) => ({value: v, label: playlistModeNames[v]}))
    });
    if (typeof mode !== "string") {
      return;
    }
    this.spinner.show(this.loaderId);
    const id = this.contextMenuData.playlistId.toString();
    const success = await this.music.setPlaylistRaw(id, mode);
    this.spinner.hide(this.loaderId);
    if (success) {
      this.music.playlistId$.next(id);
    }
  }
}
