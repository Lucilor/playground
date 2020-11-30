import {Component} from "@angular/core";
import {paths} from "@src/app/app.common";
import {Subscribed} from "@src/app/mixins/Subscribed.mixin";
import {MusicService} from "@src/app/modules/music-player/services/music.service";

@Component({
    selector: "app-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.scss"]
})
export class IndexComponent extends Subscribed() {
    paths: typeof paths;

    constructor(private music: MusicService) {
        super();
        this.paths = {...paths};
        for (const key in this.paths) {
            const k = key as keyof typeof paths;
            this.paths[k] = "/" + this.paths[k];
        }
    }

    getPath(key: keyof typeof paths) {
        return "/" + paths[key];
    }
}
