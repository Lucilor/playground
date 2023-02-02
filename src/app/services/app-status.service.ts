import {Injectable} from "@angular/core";
import {ListRandom, loadImage, timeout} from "@lucilor/utils";
import {HttpService} from "@modules/http/services/http.service";
import Color from "color";
import ColorThief from "colorthief";
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
    url: null as string | null,
    fixedUrl: null as string | null
  };
  bgClass$ = new BehaviorSubject<string[]>([]);
  bgStyle$ = new BehaviorSubject<Partial<Properties>>({});
  bgColor$ = new BehaviorSubject<Color>(new Color(0xffffff));

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
        this._bgNext();
      }
    })();
    this._bgRandomLoop();
    this._bgLoop();
  }

  private _bgNext(url?: string | null) {
    const config = this.bgConfig;
    if (typeof config.fixedUrl === "string") {
      config.url = config.fixedUrl;
    } else if (typeof url === "string") {
      config.url = url;
    } else {
      if (config.list.list.length > 0) {
        config.url = `${config.base}/${config.list.next()}`;
      } else {
        config.url = null;
      }
    }
  }

  async _bgRandomLoop() {
    const {randomInterval} = this.bgConfig;
    this._bgNext();
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
        this.bgClass$.next(["bg-out"]);
        this.bgStyle$.next({...style, animationDuration: `${outDuration}ms`});
        await timeout(outDuration);
        this.bgClass$.next(["bg-in"]);
        style.backgroundImage = `url(${url})`;
        style.animationDuration = `${inDuration}ms`;
        this.bgStyle$.next(style);

        let image: HTMLImageElement | undefined;
        try {
          image = await loadImage(url, true);
        } catch (error) {
          console.warn("failed to load image: " + url);
        }
        if (image) {
          const color = new Color(new ColorThief().getColor(image));
          this.bgColor$.next(color);
        }

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

  async setFixedBgUrl(url: string | null) {
    this.bgConfig.fixedUrl = url;
    this._bgNext();
  }
}
