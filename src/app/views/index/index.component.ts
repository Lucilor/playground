import {Component} from "@angular/core";
import {routesInfo} from "@src/app/app.common";
import {Subscribed} from "@src/app/mixins/Subscribed.mixin";
import {cloneDeep} from "lodash";

@Component({
    selector: "app-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.scss"]
})
export class IndexComponent extends Subscribed() {
    routesInfo: typeof routesInfo;

    constructor() {
        super();
        this.routesInfo = cloneDeep(routesInfo);
        delete this.routesInfo.index;
        for (const key in this.routesInfo) {
            const k = key as keyof typeof routesInfo;
            this.routesInfo[k].path = "/" + this.routesInfo[k].path;
        }
    }
}
