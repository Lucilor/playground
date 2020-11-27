import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {timeout} from "@lucilor/utils";
import {NeteaseMusicService} from "@src/app/modules/http/services/netease-music.service";
import cplayer from "cplayer";
import {random} from "lodash";

@Component({
    selector: "app-music-player",
    templateUrl: "./music-player.component.html",
    styleUrls: ["./music-player.component.scss"]
})
export class MusicPlayerComponent implements AfterViewInit {
    player?: cplayer;
    @ViewChild("playerEl", {read: ElementRef}) playerEl?: ElementRef<HTMLDivElement>;

    get posterEl() {
        return this.playerEl?.nativeElement.querySelector(".cp-poster") as HTMLDivElement;
    }

    constructor(private musicService: NeteaseMusicService) {}

    async ngAfterViewInit() {
        await timeout();
        await this.initPlayer("74222484");
        // await this.initPlayer("74222476");
    }

    async initPlayer(playlistId: string) {
        const playlist = await this.musicService.getPlayList(playlistId);
        if (playlist && this.playerEl) {
            this.player = new cplayer({
                element: this.playerEl.nativeElement,
                playlist: playlist.content,
                zoomOutKana: true,
                style: "position: absolute;bottom: 0;right:0"
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
