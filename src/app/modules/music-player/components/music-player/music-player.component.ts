import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {local} from "@app/app.common";
import {timeout} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {MusicService} from "@modules/music-player/services/music.service";
import {AppStatusService} from "@services/app-status.service";
import cplayer from "cplayer";
import {random} from "lodash";

@Component({
    selector: "app-music-player",
    templateUrl: "./music-player.component.html",
    styleUrls: ["./music-player.component.scss"]
})
export class MusicPlayerComponent extends AppStorage() implements AfterViewInit {
    player?: cplayer;
    isMini: boolean;
    @ViewChild("playerEl", {read: ElementRef}) playerEl?: ElementRef<HTMLDivElement>;

    get posterEl() {
        return this.playerEl?.nativeElement.querySelector(".cp-poster") as HTMLDivElement;
    }

    constructor(private music: MusicService, private status: AppStatusService) {
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
        this.music.playlistId.next(this.load("playlist") || "74222476");
        this.music.playlistId.subscribe((playlistId) => {
            this.save("playlist", playlistId);
            this.initPlayer(playlistId);
        });
    }

    async initPlayer(playlistId: string) {
        this.status.startLoader({id: "musicPlayerLoader"});
        const playlist = await this.music.getPlaylist(playlistId);
        this.status.stopLoader();
        if (playlist && this.playerEl) {
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

    toggleMini() {
        this.isMini = !this.isMini;
        this.save("isMini", this.isMini);
    }
}
