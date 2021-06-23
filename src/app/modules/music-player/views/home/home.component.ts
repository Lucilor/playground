import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {session} from "@app/app.common";
import {loadImage} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {Subscribed} from "@mixins/subscribed.mixin";
import {MusicService, User} from "@modules/music-player/services/music.service";
import Color from "color";
import ColorThief from "colorthief";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent extends AppStorage(Subscribed()) implements OnInit {
    user: User | null = null;
    get backgroundStyle(): Partial<CSSStyleDeclaration> {
        const url = this.user?.profile.backgroundUrl;
        if (url) {
            return {backgroundImage: `url(${url})`, filter: "unset"};
        } else {
            return {};
        }
    }
    userProfileStyle: Partial<CSSStyleDeclaration> = {};
    get avatarStyle(): Partial<CSSStyleDeclaration> {
        const url = this.user?.profile.avatarUrl;
        if (url) {
            return {backgroundImage: `url(${url})`};
        } else {
            return {backgroundImage: "./assets/images/empty.jpg"};
        }
    }
    mainColor: Color = new Color("white");
    @ViewChild("userProfileTabGroup") userProfileTabGroup!: ElementRef<HTMLDivElement>;

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

    constructor(private music: MusicService) {
        super("musicPlayer/home", session);
    }

    ngOnInit() {
        this.subscribe(this.music.user$, (user) => {
            this.updateUser(user);
        });
    }

    async updateUser(user: User | null) {
        this.user = user;
        if (user) {
            // user.profile.backgroundUrl = "./assets/images/background.jpg";
            const image = await loadImage(user.profile.backgroundUrl, true);
            const color = new Color(new ColorThief().getColor(image));
            const colorRevert = color.negate();
            this.mainColor = color;
            const el = this.userProfileTabGroup.nativeElement;
            el.querySelectorAll<HTMLElement>(".mat-ink-bar").forEach((v) => (v.style.backgroundColor = colorRevert.string()));
            el.querySelectorAll<HTMLElement>(".mat-tab-nav-bar, .mat-tab-header").forEach(
                (v) => (v.style.borderBottomColor = colorRevert.alpha(0.24).string())
            );
            this.userProfileStyle = {
                backgroundColor: color.alpha(0.5).string(),
                color: color.isLight() ? "black" : "white"
            };
        }
    }
}
