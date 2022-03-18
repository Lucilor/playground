import {Injectable} from "@angular/core";
import cplayer from "cplayer";
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AppStatusService {
    loaderId$ = new BehaviorSubject<string>("master");
    loaderText$ = new BehaviorSubject<string>("");
    cplayer$ = new BehaviorSubject<cplayer | null>(null);

    constructor() {}
}
