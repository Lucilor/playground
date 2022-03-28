import {Injectable} from "@angular/core";
import {ListRandom, timeout} from "@lucilor/utils";
import {HttpService} from "@modules/http/services/http.service";
import cplayer from "cplayer";
import {Properties} from "csstype";
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
    bgConfig = {
        interval: 1000,
        inDuration: 500,
        outDuration: 500,
        randomInterval: 60000,
        list: new ListRandom<string>([]),
        base: "",
        url: null as string | null
    };
    bgStyle$ = new BehaviorSubject<Partial<Properties>>({});

    constructor(private http: HttpService) {
        (async () => {
            const infoResponse = await this.http.get<AppInfo>("api/playground/info");
            if (infoResponse?.data) {
                this.info$.next(infoResponse.data);
            } else {
                this.info$.next(null);
            }

            const bgResponse = await this.http.get<{base: string; images: string[]}>("api/images/bg");
            if (bgResponse?.data) {
                this.bgConfig.base = bgResponse.data.base;
                this.bgConfig.list = new ListRandom(bgResponse.data.images);
                this.bgConfig.url = `${this.bgConfig.base}/${this.bgConfig.list.next()}`;
            }
        })();
        this._bgRandomLoop();
        this._bgLoop();
    }

    bgNext(url?: string) {
        const {base, list} = this.bgConfig;
        if (url) {
            this.bgConfig.url = url;
        } else {
            if (list.list.length > 0) {
                this.bgConfig.url = `${base}/${list.next()}`;
            } else {
                this.bgConfig.url = null;
            }
        }
    }

    async _bgRandomLoop() {
        const {randomInterval} = this.bgConfig;
        this.bgNext();
        await timeout(randomInterval);
        await this._bgRandomLoop();
    }

    async _bgLoop() {
        const {interval, inDuration, outDuration} = this.bgConfig;
        const url = this.bgConfig.url;
        const style = this.bgStyle$.value;
        if (url) {
            const backgroundImage = `url(${url})`;
            if (backgroundImage !== style.backgroundImage) {
                this.bgStyle$.next({...style, animation: `bg-out ${outDuration}ms`});
                await timeout(outDuration);
                style.backgroundImage = `url(${url})`;
                style.animation = `bg-in ${inDuration}ms`;
                this.bgStyle$.next(style);
                await timeout(inDuration + interval);
            } else {
                await timeout(interval);
            }
        } else {
            delete style.backgroundImage;
            await timeout(interval);
        }
        await this._bgLoop();
    }
}
