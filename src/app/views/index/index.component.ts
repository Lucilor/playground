import {Component} from "@angular/core";
import {routesInfo} from "@app/app.common";
import {Subscribed} from "@mixins/subscribed.mixin";
import {AppStatusService} from "@services/app-status.service";
import {cloneDeep} from "lodash";

@Component({
    selector: "app-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.scss"]
})
export class IndexComponent extends Subscribed() {
    routesInfo: {
        path: string;
        title: string;
        beta?: boolean | undefined;
    }[];
    bgConfig = this.status.bgConfig;

    constructor(private status: AppStatusService) {
        super();
        this.routesInfo = [];
        for (const v of Object.values(cloneDeep(routesInfo))) {
            if (!["index", "blog"].includes(v.path)) {
                const v2 = cloneDeep(v);
                v2.path = "/" + v2.path;
                this.routesInfo.push(v2);
            }
        }
    }
}
