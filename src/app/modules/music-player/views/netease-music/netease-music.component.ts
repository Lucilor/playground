import {trigger, transition, style, animate} from "@angular/animations";
import {Component} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {MatSelectionListChange} from "@angular/material/list";
import {AnyObject} from "@lucilor/utils";
import {Subscribed} from "@src/app/mixins/Subscribed.mixin";
import {MessageService} from "@src/app/modules/message/services/message.service";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {MusicService, User} from "../../services/music.service";

@Component({
    selector: "app-netease-music",
    templateUrl: "./netease-music.component.html",
    styleUrls: ["./netease-music.component.scss"],
    animations: [
        trigger("tab", [
            transition(":enter", [style({transform: "scale(0)", opacity: 0}), animate("0.3s", style({transform: "scale(1)", opacity: 1}))]),
            transition(":leave", [style({transform: "scale(1)", opacity: 0}), animate("0.3s", style({transform: "scale(0)", opacity: 1}))])
        ])
    ]
})
export class NeteaseMusicComponent extends Subscribed() {
    form: FormGroup;
    user: User | null = null;
    playlists: AnyObject[] = [];
    playlistIdx = -1;
    playModes = [
        {value: "listloop", name: "列表循环"},
        {value: "singlecycle", name: "单曲循环"},
        {value: "listrandom", name: "列表随机"}
    ];
    playMode = this.playModes[0].value;

    get playlist(): AnyObject {
        return this.playlists[this.playlistIdx];
    }

    userValidator: ValidatorFn = (control: AbstractControl) => {
        const emailError = Validators.email(control);
        const phoneNumError = Validators.pattern(/^1[3-9]\d{9}$/)(control);
        return !emailError ? emailError : phoneNumError;
    };

    constructor(
        private formBuilder: FormBuilder,
        private music: MusicService,
        private loader: NgxUiLoaderService,
        private message: MessageService
    ) {
        super();
        this.form = this.formBuilder.group({
            user: ["", [Validators.required, this.userValidator]],
            password: ["", Validators.required]
        });
        this.music.userChange.subscribe(async (user) => {
            this.user = user;
            if (user) {
                this.loader.startLoader("playlistLoader");
                this.playlists = await this.music.getPlaylists(1);
                this.loader.stopLoader("playlistLoader");
            }
        });
    }

    login() {
        const form = this.form;
        if (form.untouched) {
            form.markAllAsTouched();
        }
        if (form.valid) {
            const {user, password} = form.value;
            this.loader.start();
            this.music.login(user, password, !Validators.email(form.get("user") as AbstractControl));
            this.loader.stop();
        }
    }

    logout() {
        this.loader.start();
        this.music.logout();
        this.loader.stop();
    }

    getUserInfo(key: keyof User["profile"]) {
        const value = this.user?.profile[key];
        if (typeof value === "string") {
            return value;
        }
        return "";
    }

    async selectPlaylist(event: MatSelectionListChange) {
        const option = event.options[0];
        option.toggle();
        this.playlistIdx = this.playlists.findIndex((v) => v.id === option.value);
        const playlist = this.playlists[this.playlistIdx];
        if (playlist && !playlist.tracks) {
            this.loader.startLoader("playlistSongsLoader")
            const detail = await this.music.getPlaylistDetail(playlist.id);
            this.loader.stopLoader("playlistSongsLoader")
            if (detail) {
                this.playlists[this.playlistIdx] = detail;
            }
        }
    }

    getSongDesc(song: AnyObject) {
        return song.al.name + " - " + (song.ar as any[]).map((v) => v.name).join(" & ");
    }

    async selectPlaylistToPlay() {
        const playlist = this.playlist;
        if (playlist) {
            const yes = await this.message.confirm("是否播放此歌单？");
            if (yes) {
                this.loader.startLoader("playlistLoader");
                await this.music.setPlaylist(playlist.id, this.playMode);
                this.music.playlistId.next(playlist.id);
                this.loader.stopLoader("playlistLoader");
            }
        }
    }

    async showPlaylistDesc() {
        this.message.alert(this.playlist.description);
    }
}
