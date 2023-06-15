import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {navigate} from "@app/app.common";
import {RouteInfo} from "@app/routing/app-routing.module";
import {Subscribed} from "@mixins/subscribed.mixin";
import {AppStatusService} from "@services/app-status.service";
import {cloneDeep} from "lodash";

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"]
})
export class IndexComponent extends Subscribed() {
  routesInfo: RouteInfo[];
  bgConfig = this.status.bgConfig;

  constructor(private status: AppStatusService, private router: Router) {
    super();
    this.routesInfo = [];
    const routesInfo = this.router.config as RouteInfo[];
    for (const v of routesInfo) {
      if (v.data?.hiddinInIndex || !v.title) {
        continue;
      }
      this.routesInfo.push(cloneDeep(v));
    }
  }

  onLinkClick(routeInfo: RouteInfo) {
    navigate(this.router, routeInfo);
  }
}
