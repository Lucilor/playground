import {Component, Input} from "@angular/core";
import {Utils} from "@mixins/utils.mixin";
import {MusicService, PlaylistMode, playlistModeNames, PlaylistRaw, Song} from "@modules/music-player/services/music.service";
import Color from "color";
import {Properties} from "csstype";
import {typedFormControl, typedFormGroup, TypedFormGroup} from "ngx-forms-typed";

@Component({
    selector: "app-curr-playlist",
    templateUrl: "./curr-playlist.component.html",
    styleUrls: ["./curr-playlist.component.scss"]
})
export class CurrPlaylistComponent extends Utils() {
    @Input() mainColor = new Color("white");
    playlist$ = this.music.playlist$;
    form: TypedFormGroup<Omit<PlaylistRaw, "content">> = typedFormGroup({
        id: typedFormControl(""),
        name: typedFormControl(""),
        cover: typedFormControl(""),
        mode: typedFormControl("")
    });
    get containerStyle(): Partial<Properties> {
        return {color: this.mainColor.isLight() ? "black" : "white"};
    }
    playlistModeNames = playlistModeNames;

    constructor(private music: MusicService) {
        super();
    }

    isModeName(name: string) {
        return name in this.playlistModeNames;
    }

    getModeName(name: string) {
        return this.playlistModeNames[name as PlaylistMode] || "";
    }

    getTrackSubtitle({album, artist}: Song) {
        return `${artist} - ${album}`;
    }

    getPlaylistUrl(playlist: PlaylistRaw) {
        return `https://music.163.com/#/playlist?id=${playlist.id}`;
    }
}
