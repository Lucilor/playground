import {Component, Input, OnInit} from "@angular/core";
import {MatSelectionListChange} from "@angular/material/list";
import {MusicService, Playlist} from "@modules/music-player/services/music.service";
import Color from "color";

@Component({
    selector: "app-playlists",
    templateUrl: "./playlists.component.html",
    styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent implements OnInit {
    @Input() mainColor = new Color("white");
    playlists: Playlist[] = [];

    constructor(private music: MusicService) {}

    async ngOnInit() {
        this.playlists = await this.music.getPlaylists(1, 30);
    }

    selectPlaylist(event: MatSelectionListChange) {}
}
