import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {local} from "@app/app.common";
import {timeout} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {MusicService} from "@modules/music-player/services/music.service";
import {AppStatusService} from "@services/app-status.service";
import cplayer from "cplayer";
import {random} from "lodash";
import {BehaviorSubject} from "rxjs";

@Component({
    selector: "app-music-player",
    templateUrl: "./music-player.component.html",
    styleUrls: ["./music-player.component.scss"]
})
export class MusicPlayerComponent extends AppStorage() implements AfterViewInit {
    player$ = new BehaviorSubject<cplayer | null>(null);
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
            this.initPlayer(Number(playlistId));
        });
    }

    async initPlayer(playlistId: number) {
        this.status.startLoader({id: "musicPlayerLoader"});
        const playlist = await this.music.getPlaylist(playlistId);
        this.status.stopLoader();
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
