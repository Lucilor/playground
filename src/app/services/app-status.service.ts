import {Injectable} from "@angular/core";
import cplayer from "cplayer";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AppStatusService {
    loaderId$ = new BehaviorSubject<string>("master");
    loaderText$ = new BehaviorSubject<string>("");
    cplayer$ = new BehaviorSubject<cplayer | null>(null);

    constructor(private loaderService: NgxUiLoaderService) {}

    startLoader(config: {id?: string; text?: string} = {}) {
        const {id, text} = config;
        if (typeof id === "string") {
            this.loaderId$.next(id);
        }
        if (typeof text === "string") {
            this.loaderText$.next(text);
        }
        this.loaderService.startLoader(this.loaderId$.getValue());
    }

    stopLoader() {
        this.loaderService.stopLoader(this.loaderId$.getValue());
        this.loaderId$.next("master");
        this.loaderText$.next("");
    }
}
