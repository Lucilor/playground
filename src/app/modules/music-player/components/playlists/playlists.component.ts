import {Component, Input, OnInit} from "@angular/core";
import {MatSelectionListChange} from "@angular/material/list";
import {timeout} from "@lucilor/utils";
import {MusicService} from "@modules/music-player/services/music.service";
import {Playlist, PlaylistDetail, Track} from "@modules/music-player/services/netease-music.types";
import {AppStatusService} from "@services/app-status.service";
import {fadeInUpOnEnterAnimation, fadeOutDownOnLeaveAnimation} from "angular-animations";
import Color from "color";

@Component({
    selector: "app-playlists",
    templateUrl: "./playlists.component.html",
    styleUrls: ["./playlists.component.scss"],
    animations: [
        fadeInUpOnEnterAnimation({anchor: "enter", duration: 500, delay: 100}),
        fadeOutDownOnLeaveAnimation({anchor: "leave", duration: 500, delay: 100})
    ]
})
export class PlaylistsComponent implements OnInit {
    @Input() mainColor = new Color("white");
    limit = 10;
    playlistsPage = 0;
    playlistsMaxPage = 0;
    tracksPage = 0;
    tracksMaxPage = 0;
    playlists: Playlist[] = [];
    playlist: PlaylistDetail | null = null;
    allTracks: Track[] = [];
    track: Track | null = null;
    loaderId = "music-player-playlists";
    loading = false;
    level = 0;
    get btnStyle(): Partial<CSSStyleDeclaration> {
        return {color: this.mainColor.isLight() ? "black" : "white"};
    }

    constructor(private music: MusicService, private status: AppStatusService) {}

    async ngOnInit() {
        this.playlistsMaxPage = this._getMaxPage(await this.music.getPlaylistCount());
        await this.playlistsNextPage();
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

    async onPsYReachEnd() {
        switch (this.level) {
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

    async selectPlaylist(event: MatSelectionListChange) {
        const id: Playlist["id"] = event.options[0].value;
        this.status.startLoader({id: this.loaderId});
        const playlist = await this.music.getPlaylistDetail(id);
        this.playlist = playlist;
        this.status.stopLoader();
        await timeout(0);
        this.level++;
        this.allTracks = playlist ? playlist.tracks : [];
        this.tracksMaxPage = this._getMaxPage(this.allTracks.length);
        this.tracksPage = 0;
        this.tracksNextPage();
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
        if (tracks) {
            this.track = tracks[0];
        }
        await timeout(0);
        this.level++;
    }

    back() {
        this.level--;
    }
}
