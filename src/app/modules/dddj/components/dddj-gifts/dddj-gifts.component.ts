import {Component, OnInit} from "@angular/core";
import {setGlobal} from "@app/app.common";
import {DaidaiConfig, DaidaiGift, DaidaiGiftGroup} from "@modules/dddj/dddj.types";
import {DddjService} from "@modules/dddj/services/dddj.service";
import {MessageService} from "@modules/message/services/message.service";
import SVGA from "svgaplayerweb";

@Component({
  selector: "app-dddj-gifts",
  templateUrl: "./dddj-gifts.component.html",
  styleUrls: ["./dddj-gifts.component.scss"]
})
export class DddjGiftsComponent implements OnInit {
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

  constructor(private dddjService: DddjService, private message: MessageService) {}

  async ngOnInit() {
    setGlobal("dddj", this);
    const config = await this.dddjService.getConfig();
    const giftGroups = await this.dddjService.getGiftGroups();
    if (config && giftGroups) {
      this.config = config;
      this.giftGroups = giftGroups;
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
