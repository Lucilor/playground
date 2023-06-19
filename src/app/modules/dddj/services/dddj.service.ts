import {Injectable, Injector} from "@angular/core";
import {HttpService} from "@modules/http/services/http.service";
import {DaidaiConfig, DaidaiGiftGroup} from "../dddj.types";

@Injectable({
  providedIn: "root"
})
export class DddjService extends HttpService {
  host = "https://play.daidaiyuyin.com" as const;

  constructor(injector: Injector) {
    super(injector);
    this.baseURL = `${this.host}/web/api`;
  }

  async getConfig() {
    const response = await this.get<DaidaiConfig>(
      "https://conf.58youxi.com/config/api/base/dicts?source=1&hostName=daidaiyuyin.com",
      {},
      {noStrict: true}
    );
    return this.getResponseData(response, true);
  }

  async getGiftGroups() {
    const response = await this.get<DaidaiGiftGroup[]>("gift/getGiftList", {}, {noStrict: true});
    return this.getResponseData(response, true);
  }
}
