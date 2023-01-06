import {Component, OnInit} from "@angular/core";
import {setGlobal} from "@app/app.common";
import {ObjectOf, timeout} from "@lucilor/utils";
import {HttpService} from "@modules/http/services/http.service";
import {MessageService} from "@modules/message/services/message.service";
import {cloneDeep} from "lodash";
import SVGA from "svgaplayerweb";
import {DaidaiConfig, DaidaiGiftGroup, DaidaiBottle, DaidaiGift, daidaiUrls, DaidaiBottleInfo} from "./dddj.types";

@Component({
  selector: "app-dddj",
  templateUrl: "./dddj.component.html",
  styleUrls: ["./dddj.component.scss"]
})
export class DddjComponent implements OnInit {
  config: DaidaiConfig = {
    blackList: [],
    path: {
      baseVideoPath: "https://img-play.daidaiyuyin.com/video/",
      imgPath: "https://img-play.daidaiyuyin.com/img/",
      live: "daidaiyuyin.com",
      privacyPath: "daidaidj.com"
    }
  };
  giftGroups: DaidaiGiftGroup[] = [];
  bottles: DaidaiBottle[] = [];
  player?: SVGA.Player;
  parser?: SVGA.Parser;
  isSvgaPlaying = false;

  constructor(private http: HttpService, private message: MessageService) {}

  async ngOnInit() {
    setGlobal("dddj", this);
    const configResponse = await this.http.get<DaidaiConfig>(daidaiUrls.config, {}, {noStrict: true});
    const giftResponse = await this.http.get<DaidaiGiftGroup[]>(daidaiUrls.getGiftList, {}, {noStrict: true});
    const bottlesResponse = await this.http.get<ObjectOf<DaidaiBottle>>(daidaiUrls.getBottleGift, {}, {noStrict: true});
    const bottlesInfoResponse = await this.http.get<DaidaiBottleInfo[]>(daidaiUrls.queryBottleGift, {}, {noStrict: true});
    if (configResponse?.data && giftResponse?.data) {
      this.config = configResponse.data;
      this.giftGroups = giftResponse.data;
      const bottles = Object.values(bottlesResponse?.data || {});
      const bottlesInfo = bottlesInfoResponse?.data || [];
      bottles.sort((a, b) => a.onceDiamond - b.onceDiamond);
      this.bottles = bottles;
      for (const bottle of bottles) {
        const prizes = bottle.prize.prizes;
        const group: DaidaiGiftGroup = {
          giftTypeName: bottle.bottleName,
          giftWebVoList: []
        };
        const info = bottlesInfo.find((v) => v.bottleName === bottle.bottleName);
        if (info) {
          bottle.gifts = [];
          bottle.expectedValue = 0;
          for (const gift of info.giftList) {
            const prize = prizes.find((v) => v.giftTitle === gift.giftName);
            const bottleGift: DaidaiGift = {
              giftName: gift.giftName,
              giftIcon: prize?.giftPic || "",
              giftPrice: gift.giftPrice / 100,
              probability: gift.showOdd / 10
            };
            group.giftWebVoList.push(bottleGift);
            bottle.gifts.push(cloneDeep(bottleGift));
            bottle.expectedValue += (bottleGift.giftPrice * (bottleGift.probability || 0)) / 100;
          }
        }
        group.giftWebVoList.unshift({
          giftName: bottle.bottleName,
          giftIcon: bottle.briefPic,
          giftPrice: bottle.onceDiamond / 100,
          mtSvg: bottle.animationApp,
          pcSvg: bottle.animationPc,
          expectedValue: bottle.expectedValue
        });
        this.giftGroups.push(group);
      }
      for (const group of this.giftGroups) {
        for (const gift of group.giftWebVoList) {
          const bottle = bottles.find((v) => v.bottleName === gift.giftName);
          if (bottle) {
            gift.mtSvg = bottle.animationApp;
            gift.pcSvg = bottle.animationPc;
            gift.expectedValue = bottle.expectedValue;
          }
        }
      }
    } else {
      this.message.error("获取数据失败");
    }
    this.config.path.imgPath = location.origin + "/daidai/img/";
  }

  async showGiftPreview(gift: DaidaiGift) {
    const {mtSvg, appVoice} = gift;
    if (!mtSvg) {
      this.message.snack("该礼物没有动画");
    } else {
      await this.playSvga(mtSvg, appVoice);
    }
    const bottle = this.bottles.find((v) => v.bottleName === gift.giftName);
    if (bottle) {
      await timeout(200);
      this.openBottle(bottle);
    }
  }

  openBottle(bottle: DaidaiBottle) {
    const gifts = bottle.gifts;
    if (!gifts) {
      this.message.snack("该瓶子没有礼物");
      return;
    }
    const n = Math.random();
    let m = 0;
    let selectedGift: DaidaiGift | undefined;
    for (const gift of gifts) {
      const p = (gift.probability || 0) / 100;
      if (n >= m && n < m + p) {
        selectedGift = gift;
        break;
      }
      m += p;
    }
    if (selectedGift) {
      const {giftName, giftPrice} = selectedGift;
      const bottlePrice = bottle.onceDiamond / 100;
      const diffPrice = giftPrice - bottlePrice;
      const diffPriceStr = Math.abs(diffPrice).toFixed(2);
      this.message.alert({
        title: `${bottle.bottleName}(¥${bottlePrice})`,
        content: `你抽中了${giftName}，价值¥${giftPrice}，${diffPrice > 0 ? "赚" : "亏"}了${diffPriceStr}元。`
      });
    } else {
      this.message.snack("瓶子概率有误");
    }
  }

  private _initSvga() {
    const player = new SVGA.Player("#gift-preview");
    const parser = new SVGA.Parser();
    player.loops = 1;
    player.clearsAfterStop = true;
    player.onFinished(() => {
      this.isSvgaPlaying = false;
    });
    this.player = player;
    this.parser = parser;
  }

  async playSvga(svgUrl: string, musicUrl?: string) {
    if (!this.player || !this.parser) {
      this._initSvga();
    }
    if (!this.player || !this.parser) {
      return;
    }
    const {player, parser, config} = this;
    const loadSvga = new Promise<SVGA.VideoEntity>((resolve, reject) => {
      parser.load(config.path.imgPath + svgUrl, (videoItem) => {
        resolve(videoItem);
      });
    });
    const playAudio = new Promise<HTMLAudioElement | null>((resolve) => {
      if (musicUrl) {
        const audio = new Audio(config.path.imgPath + musicUrl);
        // fixme: not working on mobile device
        // audio.addEventListener("canplay", () => resolve(audio));
        resolve(audio);
      } else {
        resolve(null);
      }
    });
    const result = await Promise.all([loadSvga, playAudio]);
    this.isSvgaPlaying = true;
    player.setVideoItem(result[0]);
    player.startAnimation();
    result[1]?.play();
    return new Promise<void>((resolve) => {
      player.onFinished(() => {
        resolve();
        player.clear();
        player.clearDynamicObjects();
        this.isSvgaPlaying = false;
      });
      // resolve();
    });
  }
}
