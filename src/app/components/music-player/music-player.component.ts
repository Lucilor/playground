import {Component, OnInit} from "@angular/core";
import {NeteaseMusicService} from "@src/app/modules/http/services/netease-music.service";

@Component({
    selector: "app-music-player",
    templateUrl: "./music-player.component.html",
    styleUrls: ["./music-player.component.scss"]
})
export class MusicPlayerComponent implements OnInit {
    constructor(private musicService: NeteaseMusicService) {}

    async ngOnInit() {
        const playlist = await this.musicService.getPlayList("497149159");
        // const playlist = await this.musicService.getPlayList("74222476");
        console.log(playlist);
    }
}
