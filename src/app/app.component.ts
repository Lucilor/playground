import {Component} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {paths} from "./app.common";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    title = "playground";
    loaderText = "";
    showHomeBtn = false;

    constructor(private router: Router) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.showHomeBtn = event.url !== "/" + paths.index;
            }
        });
    }
}
