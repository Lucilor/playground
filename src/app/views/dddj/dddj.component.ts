import {Component, OnInit} from "@angular/core";
import {setGlobal} from "@app/app.common";
import {HttpService} from "@modules/http/services/http.service";
import {MessageService} from "@modules/message/services/message.service";
import SVGA from "svgaplayerweb";
import {DaidaiConfig, DaidaiGift, DaidaiGiftGroup, daidaiUrls} from "./dddj.types";

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
  player?: SVGA.Player;
  parser?: SVGA.Parser;
  isSvgaPlaying = false;

  constructor(private http: HttpService, private message: MessageService) {}

  async ngOnInit() {
    setGlobal("dddj", this);
    const configResponse = await this.http.get<DaidaiConfig>(daidaiUrls.config, {}, {noStrict: true});
    const giftResponse = await this.http.get<DaidaiGiftGroup[]>(daidaiUrls.getGiftList, {}, {noStrict: true});
    if (configResponse?.data && giftResponse?.data) {
      this.config = configResponse.data;
      this.giftGroups = giftResponse.data;
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
      parser.load(
        config.path.imgPath + svgUrl,
        (videoItem) => {
          resolve(videoItem);
        },
        (error) => {
          reject(error);
        }
      );
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
