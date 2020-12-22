import {Component} from "@angular/core";
import {routesInfo} from "@src/app/app.common";
import {Subscribed} from "@src/app/mixins/Subscribed.mixin";
import {MusicService} from "@src/app/modules/music-player/services/music.service";
import {cloneDeep} from "lodash";

@Component({
    selector: "app-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.scss"]
})
export class IndexComponent extends Subscribed() {
    routesInfo: typeof routesInfo;

    constructor(private music: MusicService) {
        super();
        this.routesInfo = cloneDeep(routesInfo);
        delete this.routesInfo.index;
        for (const key in this.routesInfo) {
            const k = key as keyof typeof routesInfo;
            this.routesInfo[k].path = "/" + this.routesInfo[k].path;
        }
    }

    getPath(key: keyof typeof routesInfo) {
        return "/" + routesInfo[key];
    }
}
