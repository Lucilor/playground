import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {session} from "@app/app.common";
import {timeout} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {Subscribed} from "@mixins/subscribed.mixin";
import {PlaylistsComponent} from "@modules/music-player/components/playlists/playlists.component";
import {MusicService} from "@modules/music-player/services/music.service";
import {User} from "@modules/music-player/services/netease-music.types";
import {AppStatusService} from "@services/app-status.service";
import Color from "color";
import {Properties} from "csstype";
import {BehaviorSubject} from "rxjs";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent extends AppStorage(Subscribed()) implements AfterViewInit, OnDestroy {
    user: User | null = null;
    backgroundUrl$ = new BehaviorSubject<string | null | undefined>(null);
    userProfileStyle: Partial<Properties> = {};
    get avatarStyle(): Partial<Properties> {
        const url = this.user?.profile.avatarUrl;
        if (url) {
            return {backgroundImage: `url(${url})`};
        } else {
            return {backgroundImage: "./assets/images/empty.jpg"};
        }
    }
    mainColor: Color = new Color("white");
    @ViewChild("userProfileTabGroup") userProfileTabGroup!: ElementRef<HTMLDivElement>;
    @ViewChild(PlaylistsComponent) playlists!: PlaylistsComponent;

    private _tabGroupIndex = -1;
    get tabGroupIndex() {
        if (!(this._tabGroupIndex >= 0)) {
            this._tabGroupIndex = this.load("tabGroupIndex") || 0;
        }
        return this._tabGroupIndex;
    }
    set tabGroupIndex(value) {
        this._tabGroupIndex = value;
        this.save("tabGroupIndex", value);
    }

    constructor(private music: MusicService, private status: AppStatusService) {
        super("musicPlayer/home", session);
    }

    async ngAfterViewInit() {
        await timeout(0);
        this.subscribe(this.playlists.level$, (level) => {
            let url: string | undefined;
            if (level === 1 && this.playlists.playlist) {
                url = this.playlists.playlist.coverImgUrl;
            } else if (level === 2 && this.playlists.track) {
                url = this.playlists.track.al.picUrl;
            }
            this.backgroundUrl$.next(url);
        });
        this.subscribe(this.music.user$, (user) => {
            this.updateUser(user);
        });
        this.subscribe(this.backgroundUrl$, async (url) => {
            if (!url) {
                if (this.user?.profile.backgroundUrl) {
                    this.backgroundUrl$.next(this.user.profile.backgroundUrl);
                }
                return;
            }
            this.status.setFixedBgUrl(url);
        });
        this.subscribe(this.status.bgColor$, (color) => {
            const colorRevert = color.negate();
            this.mainColor = color;
            const el = this.userProfileTabGroup.nativeElement;
            el.querySelectorAll<HTMLElement>(".mat-ink-bar").forEach((v) => (v.style.backgroundColor = colorRevert.string()));
            el.querySelectorAll<HTMLElement>(".mat-tab-nav-bar, .mat-tab-header").forEach(
                (v) => (v.style.borderBottomColor = colorRevert.alpha(0.24).string())
            );
            this.userProfileStyle = {
                backgroundColor: color.alpha(0.7).string(),
                color: color.isLight() ? "black" : "white"
            };
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.status.setFixedBgUrl(null);
    }

    async updateUser(user: User | null) {
        this.user = user;
    }

    async logout() {
        await this.music.logout();
        location.reload();
    }
}
