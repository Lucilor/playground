import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {timeout} from "@lucilor/utils";
import cplayer from "cplayer";
import {random} from "lodash";
import {MusicService, Playlist} from "../../services/music.service";

@Component({
    selector: "app-music-player",
    templateUrl: "./music-player.component.html",
    styleUrls: ["./music-player.component.scss"]
})
export class MusicPlayerComponent implements AfterViewInit {
    player?: cplayer;
    isMini = innerWidth < 500;
    @ViewChild("playerEl", {read: ElementRef}) playerEl?: ElementRef<HTMLDivElement>;

    get posterEl() {
        return this.playerEl?.nativeElement.querySelector(".cp-poster") as HTMLDivElement;
    }

    constructor(private music: MusicService) {}

    async ngAfterViewInit() {
        await timeout();
        // await this.initPlayer("74222476");
        this.music.playlistChange.subscribe((playlist) => {
            if (playlist) {
                this.initPlayer(playlist);
            }
        });
    }

    initPlayer(playlist: Playlist) {
        if (this.playerEl) {
            this.player = new cplayer({
                element: this.playerEl.nativeElement,
                playlist: playlist.content,
                zoomOutKana: true
            });
            this.player.mode = playlist.mode;
            if (this.player.mode === "listrandom") {
                this.player.to(random(playlist.content.length));
            }
            (window as any).player = this.player;
            this.player.on("play", () => this.startPoster());
            this.player.on("pause", () => this.stopPoster());
            this.player.on("started", () => this.startPoster());
            this.player.on("ended", () => this.stopPoster());
            this.posterEl?.addEventListener("click", () => {
                this.player?.togglePlayState();
            });
        }
    }

    destroyPlayer() {
        this.player?.destroy();
    }

    startPoster() {
        this.posterEl?.classList.remove("paused");
        this.posterEl?.classList.add("playing");
    }

    stopPoster() {
        this.posterEl?.classList.remove("playing");
        this.posterEl?.classList.add("paused");
    }
}
