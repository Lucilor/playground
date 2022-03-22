import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {ListRandom} from "@lucilor/utils";
import {Subscribed} from "@mixins/subscribed.mixin";
import {MusicPlayerComponent} from "@modules/music-player/components/music-player/music-player.component";
import {AppStatusService} from "@services/app-status.service";
import {DateTime} from "luxon";
import {routesInfo} from "./app.common";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends Subscribed() implements AfterViewInit {
    title = "playground";
    titleList = new ListRandom(["想peach", "不存在的", "Are you kidding me?", "不要乱搞"]);
    loaderText = "";
    showHomeBtn = false;
    showFooter = true;
    @ViewChild(MusicPlayerComponent) musicPlayer!: MusicPlayerComponent;
    lastUpdateStr = "";

    constructor(private router: Router, private status: AppStatusService) {
        super();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const url = event.urlAfterRedirects;
                const routeInfo = Object.values(routesInfo).find((v) => url.startsWith("/" + v.path));
                this.showHomeBtn = routeInfo?.path !== "index";
                this.showFooter = routeInfo?.path !== "blog";
                document.title = routeInfo?.title || this.titleList.next();
            }
        });
        this.status.loaderText$.subscribe((text) => (this.loaderText = text));
        this.status.info$.subscribe((info) => {
            const lastUpdate = info?.lastUpdate;
            if (typeof lastUpdate === "number" && lastUpdate > 0) {
                this.lastUpdateStr = "最后更新：" + DateTime.fromMillis(lastUpdate).toFormat("yyyy-MM-dd HH:mm:ss");
            } else {
                this.lastUpdateStr = "";
            }
        });
    }

    ngAfterViewInit() {
        this.subscribe(this.musicPlayer.player$, (cplayer) => {
            this.status.cplayer$.next(cplayer);
        });
    }
}
