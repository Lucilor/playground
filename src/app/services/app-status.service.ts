import {Injectable} from "@angular/core";
import {HttpService} from "@modules/http/services/http.service";
import cplayer from "cplayer";
import {BehaviorSubject} from "rxjs";

export interface AppInfo {
    lastUpdate: number;
}

@Injectable({
    providedIn: "root"
})
export class AppStatusService {
    loaderId$ = new BehaviorSubject<string>("master");
    loaderText$ = new BehaviorSubject<string>("");
    cplayer$ = new BehaviorSubject<cplayer | null>(null);
    info$ = new BehaviorSubject<AppInfo | null>(null);

    constructor(private http: HttpService) {
        (async () => {
            const response = await this.http.get<AppInfo>("api/playground/info");
            if (response?.data) {
                this.info$.next(response.data);
            } else {
                this.info$.next(null);
            }
        })();
    }
}
