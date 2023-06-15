export const daidaiUrls = {
  config: "https://conf.58youxi.com/config/api/base/dicts?source=1&hostName=daidaiyuyin.com",
  getMagicList: "https://play.daidaiyuyin.com/web/api/gift/getMagicList?magicType=0",
  getGiftList: "https://play.daidaiyuyin.com/web/api/gift/getGiftList?source=1",
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
  // appMp4?: string;
  appVoice?: string;
  briefIntroduction?: string;
  briefPic?: string;
  // broadLimit?: number;
  // broadStatus?: number;
  // diamondAmount?: number;
  // dynamicPic?: string;
  // dynamicType?: number;
  giftIcon: string;
  // giftId: number;
  giftName: string;
  giftPrice: number;
  // glamourAmount?: number;
  // ifWeekStar?: number;
  // introduction?: string;
  // isShow?: number;
  mtSvg?: string;
  // nobleLevel?: string;
  pcSvg?: string;
  // roomids?: string;
  // status?: number;
  // typeStyle?: number;
  // url?: string;
  // wealthAdditional?: number;
  // wealthAmount?: number;
  probability?: number;
  expectedValue?: number;
}

export interface DaidaiGiftGroup {
  // giftTypeId: number;
  // giftTypeStatus: number;
  giftTypeName: string;
  giftWebVoList: DaidaiGift[];
}

export interface DaidaiBottle {
  // givePropName: string;
  // luckCouponName: string;
  // luxuryPic: string;
  animationApp: string;
  animationPc: string;
  // givePropPic: string;
  // remark: string;
  prize: {
    nowDate: number;
    endDate: number;
    prizes: {
      giftId: number;
      giftPrice: number;
      giftPic: string;
      giftTitle: string;
    }[];
    giftPic: string;
    giftTitle: string;
  };
  // givePropType: number;
  // givePropId: number;
  bottleName: string;
  briefPic: string;
  // createTime: number;
  // givePropIdV2: number;
  onceDiamond: number;
  // givePropNameV2: string;
  // givePropUnit: string;
  // rank: number;
  // id: number;
  // givePropPicV2: string;
  // luckCouponPic: string;
  // givePropUnitV2: string;
  gifts?: DaidaiGift[];
  expectedValue?: number;
}

export interface DaidaiBottleInfo {
  // bottleId: number;
  bottleName: string;
  onceDiamond: number;
  giftList: {
    giftName: string;
    giftPrice: number;
    showOdd: number;
  }[];
}
