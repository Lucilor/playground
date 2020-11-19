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

    constructor(private musicService: NeteaseMusicService) {}

    async ngAfterViewInit() {
        await timeout();
        await this.initPlayer("497149159");
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
        }
    }

    destroyPlayer() {
        this.player?.destroy();
    }
}
