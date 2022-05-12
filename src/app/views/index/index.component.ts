import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {RouteInfo, routesInfo} from "@app/app.common";
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
        for (const v of Object.values(cloneDeep(routesInfo))) {
            if (v.hiddinInIndex) {
                continue;
            }
            this.routesInfo.push(v);
        }
    }

    onLinkClick(routeInfo: RouteInfo) {
        if (routeInfo.isOuter) {
            window.open(routeInfo.path);
        } else {
            this.router.navigate([routeInfo.path], {queryParamsHandling: "merge"});
        }
    }
}
