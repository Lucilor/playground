import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {local} from "@app/app.common";
import {timeout} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {Subscribed} from "@mixins/subscribed.mixin";
import {MusicService} from "@modules/music-player/services/music.service";
import {SpinnerService} from "@modules/spinner/services/spinner.service";
import cplayer from "cplayer";
import {Lyric} from "cplayer/lib/lyric";
import {random} from "lodash";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: "app-music-player",
  templateUrl: "./music-player.component.html",
  styleUrls: ["./music-player.component.scss"]
})
export class MusicPlayerComponent extends Subscribed(AppStorage()) implements AfterViewInit {
  player$ = new BehaviorSubject<cplayer | null>(null);
  isMini: boolean;
  @ViewChild("playerEl", {read: ElementRef}) playerEl?: ElementRef<HTMLDivElement>;
  lyric: Lyric | null = null;
  tlyric: Lyric | null = null;

  get posterEl() {
    return this.playerEl?.nativeElement.querySelector(".cp-poster") as HTMLDivElement;
  }

  constructor(private music: MusicService, private spinner: SpinnerService) {
    super("musicPlayer", local);
    const isMini = this.load("isMini");
    if (typeof isMini === "boolean") {
      this.isMini = isMini;
    } else {
      this.isMini = innerWidth < 500;
    }
  }

  async ngAfterViewInit() {
    await timeout();
    this.music.playlistId$.next(this.load("playlist") || "74222476");
    this.subscribe(this.music.playlistId$, (playlistId) => {
      this.save("playlist", playlistId);
      this.initPlayer(playlistId);
    });
  }

  async initPlayer(playlistId: string) {
    this.spinner.show("musicPlayerLoader");
    const playlist = await this.music.getPlaylistRaw(playlistId);
    this.spinner.hide("musicPlayerLoader");
    if (playlist && this.playerEl) {
      const player = new cplayer({
        element: this.playerEl.nativeElement,
        playlist: playlist.content,
        zoomOutKana: true
      });
      player.mode = playlist.mode;
      if (player.mode === "listrandom") {
        player.to(random(playlist.content.length));
      }
      player.on("play", () => this.startPoster());
      player.on("pause", () => this.stopPoster());
      player.on("started", () => this.startPoster());
      player.on("ended", () => this.stopPoster());
      this.posterEl?.addEventListener("click", () => {
        player?.togglePlayState();
      });
      this.player$.next(player);
    }
  }

  destroyPlayer() {
    const player = this.player$.value;
    if (player) {
      player.destroy();
      this.player$.next(null);
    }
  }

  startPoster() {
    this.posterEl?.classList.remove("paused");
    this.posterEl?.classList.add("playing");
  }

  stopPoster() {
    this.posterEl?.classList.remove("playing");
    this.posterEl?.classList.add("paused");
  }

  toggleMini() {
    this.isMini = !this.isMini;
    this.save("isMini", this.isMini);
  }
}
