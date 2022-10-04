import {Component, OnInit} from "@angular/core";
import {HttpService} from "@modules/http/services/http.service";
import {MessageService} from "@modules/message/services/message.service";
import SVGA from "svgaplayerweb";

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
        const configResponse = await this.http.get<DaidaiConfig>(daidaiUrls.config, {}, {noStrict: true});
        const giftResponse = await this.http.get<DaidaiGiftGroup[]>(daidaiUrls.getGiftList, {}, {noStrict: true});
        if (configResponse?.data && giftResponse?.data) {
            this.config = configResponse.data;
            this.giftGroups = giftResponse.data;
            console.log(configResponse, giftResponse);
        } else {
            this.message.error("获取数据失败");
        }
        this.config.path.imgPath = location.origin + "/daidai/img/";
    }

    showGiftPreview(gift: DaidaiGift) {
        const {mtSvg, pcSvg, appVoice} = gift;
        if (!mtSvg || !pcSvg) {
            this.message.snack("该礼物没有动画");
            return;
        }
        console.log(gift);
        this.playSvga(mtSvg, appVoice);
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
    }
}

const daidaiUrls = {
    config: "https://conf.58youxi.com/config/api/base/dicts?source=1&hostName=daidaiyuyin.com",
    getMagicList: "https://play.daidaiyuyin.com/web/api/gift/getMagicList?magicType=0",
    getGiftList: "https://play.daidaiyuyin.com/web/api/gift/getGiftList?source=1",
    getBottleGift: "https://play.daidaiyuyin.com/web/api/gift/getBottleGift?source=1",
    getUserBag: "https://play.daidaiyuyin.com/web/api/box/getUserBag?source=1&uid=12878857"
};

export interface DaidaiConfig {
    blackList: string[];
    path: {
        baseVideoPath: string;
        imgPath: string;
        live: string;
        privacyPath: string;
    };
}

export interface DaidaiGift {
    appMp4?: string;
    appVoice?: string;
    briefIntroduction: string;
    briefPic: string;
    broadLimit: number;
    broadStatus: number;
    diamondAmount: number;
    dynamicPic?: string;
    dynamicType: number;
    giftIcon: string;
    giftId: number;
    giftName: string;
    giftPrice: number;
    glamourAmount: number;
    ifWeekStar: number;
    introduction: string;
    isShow: number;
    mtSvg?: string;
    nobleLevel: string;
    pcSvg?: string;
    roomids?: string;
    status: number;
    typeStyle: number;
    url: string;
    wealthAdditional: number;
    wealthAmount: number;
}

export interface DaidaiGiftGroup {
    giftTypeId: number;
    giftTypeName: string;
    giftTypeStatus: number;
    giftWebVoList: DaidaiGift[];
}
