import {Component} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {Subscribed} from "@mixins/subscribed.mixin";
import {AppStatusService} from "@services/app-status.service";
import {DateTime} from "luxon";
import {RouteInfo} from "./app-routing.module";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent extends Subscribed() {
  title = "playground";
  loaderText = "";
  showHomeBtn = false;
  showFooter = true;
  lastUpdateStr = "";
  bgClass$ = this.status.bgClass$;
  bgStyle$ = this.status.bgStyle$;

  constructor(private router: Router, private status: AppStatusService) {
    super();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        const routesInfo = this.router.config as RouteInfo[];
        const routeInfo = routesInfo.find((v) => v.path && url.startsWith("/" + v.path));
        const isIndex = routeInfo?.path === "index";
        this.showHomeBtn = !isIndex;
        this.showFooter = isIndex;
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
}
