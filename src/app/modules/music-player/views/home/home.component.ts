import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {loadImage} from "@lucilor/utils";
import {Subscribed} from "@mixins/subscribed.mixin";
import {MusicService, User} from "@modules/music-player/services/music.service";
import Color from "color";
import ColorThief from "colorthief";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent extends Subscribed() implements OnInit {
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

    constructor(private music: MusicService) {
        super();
    }

    ngOnInit() {
        this.subscribe(this.music.user$, (user) => {
            this.updateUser(user);
        });
    }

    async updateUser(user: User | null) {
        this.user = user;
        if (user) {
            user.profile.backgroundUrl = "./assets/images/background.jpg";
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
                backgroundColor: color.alpha(0.9).string(),
                color: color.isLight() ? "black" : "white"
            };
        }
    }
}
