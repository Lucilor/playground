import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {MatSelectionListChange} from "@angular/material/list";
import {MusicService} from "@modules/music-player/services/music.service";
import {Playlist, PlaylistDetail, Track} from "@modules/music-player/services/netease-music.types";
import {AppStatusService} from "@services/app-status.service";
import Color from "color";

@Component({
    selector: "app-playlists",
    templateUrl: "./playlists.component.html",
    styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent implements OnInit {
    @Input() mainColor = new Color("white");
    playlists: Playlist[] = [];
    page = 1;
    limit = 10;
    maxPage = 0;
    playlist: PlaylistDetail | null = null;
    loaderId = "music-player-playlists";
    loading = false;
    get btnStyle(): Partial<CSSStyleDeclaration> {
        return {color: this.mainColor.negate().string()};
    }

    constructor(private music: MusicService, private status: AppStatusService, private cd: ChangeDetectorRef) {}

    async ngOnInit() {
        this.maxPage = Math.ceil((await this.music.getPlaylistCount()) / this.limit);
        await this.nextPage();
    }

    async nextPage() {
        const {page, limit, maxPage} = this;
        if (page > maxPage || this.loading) {
            return;
        }
        this.loading = true;
        const playlists = await this.music.getPlaylists(page, limit);
        playlists.forEach((playlist) => this.playlists.push(playlist));
        this.loading = false;
        this.page++;
    }

    async onPsYReachEnd() {
        await this.nextPage();
    }

    async selectPlaylist(event: MatSelectionListChange) {
        const id: Playlist["id"] = event.options[0].value;
        this.status.startLoader({id: this.loaderId});
        this.playlist = await this.music.getPlaylistDetail(id);
        this.status.stopLoader();
    }

    getTrackSubtitle(track: Track) {
        const ar = track.ar.map((v) => v.name).join(", ");
        return `${ar} - ${track.al.name}`;
    }

    async selectTrack(event: MatSelectionListChange) {
        const id: Track["id"] | null = event.options[0].value;
        if (id === null) {
            this.playlist = null;
            return;
        }
        const tracks = await this.music.getTracks([id]);
        console.log(tracks);
    }
}
