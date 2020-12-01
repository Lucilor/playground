import {Component} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {paths} from "./app.common";
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

    constructor(private router: Router, private status: AppStatusService) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.showHomeBtn = event.url !== "/" + paths.index;
            }
        });
        this.status.loaderText$.subscribe((text) => (this.loaderText = text));
    }
}
