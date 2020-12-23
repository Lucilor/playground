import {Component} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {routesInfo as routesInfo} from "./app.common";
import {AppStatusService} from "./services/app-status.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    title = "playground";
    loaderText = "";
    showHomeBtn = false;
    showFooter = true;

    constructor(private router: Router, private status: AppStatusService) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const routeInfo = Object.values(routesInfo).find((v) => event.url.startsWith("/" + v.path));
                this.showHomeBtn = routeInfo?.path !== "index";
                this.showFooter = routeInfo?.path !== "blog";
                document.title = routeInfo?.title || this.getRandomTitle();
            }
        });
        this.status.loaderText$.subscribe((text) => (this.loaderText = text));
    }

    getRandomTitle() {
        const list = ["想peach", "不存在的", "Are you kidding me?", "不要乱搞"];
        const index = Math.floor(Math.random() * list.length);
        return list[index];
    }
}
