import {ObjectOf} from "@lucilor/utils";

export interface User {
  bindings: {
    bindingTime: number;
    expired: boolean;
    expiresIn: number;
    id: number;
    refreshTime: number;
    tokenJsonStr: {countrycode: string; cellphone: string; hasPassword: boolean};
    type: number;
    url: string;
    userId: number;
  }[];
  profile: {
    avatarUrl: string;
    backgroundImgId: number;
    backgroundImgIdStr: string;
    backgroundUrl: string;
    birthday: number;
    city: number;
    defaultAvatar: boolean;
    description: string;
    detailDescription: string;
    djStatus: number;
    eventCount: number;
    expertTags: string | null;
    experts: ObjectOf<any>;
    followed: boolean;
    followeds: number;
    follows: number;
    gender: number;
    mutual: boolean;
    nickname: string;
    playlistBeSubscribedCount: number;
    playlistCount: number;
    province: number;
    remarkName: string | null;
    signature: string;
    userId: number;
    userType: number;
    vipType: number;
  };
}

export interface TrackId {
  alg: null;
  at: number;
  id: number;
  rcmdReason: string;
  t: number;
  uid: number;
  v: number;
}

export interface Album {
  id: number;
  name: string;
  pic: number;
  picUrl: string;
  pic_str: string;
  tns: string[];
}

export interface Artist {
  alias: string[];
  id: number;
  name: string;
  tns: string[];
}

export interface HLM {
  br: number;
  fid: number;
  size: number;
  vd: number;
}

export interface Track {
  a: null;
  al: Album;
  alia: string[];
  ar: Artist[];
  cd: string;
  cf: string;
  copyright: number;
  cp: number;
  crbt: null;
  djId: number;
  dt: number;
  fee: number;
  ftype: number;
  h: HLM;
  id: number;
  l: HLM;
  m: HLM;
  mark: number;
  mst: number;
  mv: number;
  name: string;
  no: number;
  noCopyrightRcmd: null;
  originCoverType: number;
  originSongSimpleData: null;
  pop: number;
  pst: number;
  publishTime: number;
  rt: null;
  rtUrl: null;
  rtUrls: string[];
  rtype: number;
  rurl: null;
  s_id: number;
  single: number;
  st: number;
  t: number;
  v: number;
}

export interface Playlist {
  adType: number;
  anonimous: boolean;
  artists: null;
  backgroundCoverId: number;
  backgroundCoverUrl: string | null;
  cloudTrackCount: number;
  commentThreadId: string;
  coverImgId: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  coverImgId_str: string;
  coverImgUrl: string;
  createTime: number;
  creator: {
    defaultAvatar: boolean;
    province: number;
    authStatus: number;
    followed: boolean;
    avatarUrl: string;
  };
  description: string | null;
  englishTitle: string | null;
  highQuality: boolean;
  id: number;
  name: string;
  newImported: boolean;
  opRecommend: boolean;
  ordered: boolean;
  playCount: number;
  privacy: number;
  recommendInfo: null;
  sharedUsers: null;
  specialType: number;
  status: number;
  subscribed: boolean;
  subscribedCount: number;
  subscribers: [];
  tags: string[];
  titleImage: number;
  titleImageUrl: string | null;
  totalDuration: number;
  trackCount: number;
  trackNumberUpdateTime: number;
  trackUpdateTime: number;
  tracks: null;
  updateFrequency: null;
  updateTime: number;
  userId: number;
}

export interface PlaylistDetail {
  adType: number;
  backgroundCoverId: number;
  backgroundCoverUrl: string | null;
  cloudTrackCount: number;
  commentCount: number;
  commentThreadId: string;
  coverImgId: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  coverImgId_str: string;
  coverImgUrl: string;
  createTime: number;
  creator: User;
  description: string | null;
  englishTitle: string | null;
  highQuality: boolean;
  id: number;
  name: string;
  newImported: boolean;
  officialPlaylistType: string | null;
  opRecommend: boolean;
  ordered: boolean;
  playCount: number;
  privacy: number;
  remixVideo: null;
  shareCount: number;
  sharedUsers: null;
  specialType: number;
  status: number;
  subscribed: boolean;
  subscribedCount: number;
  subscribers: User[];
  tags: string[];
  titleImage: number;
  titleImageUrl: string | null;
  trackCount: number;
  trackIds: TrackId[];
  trackNumberUpdateTime: number;
  trackUpdateTime: number;
  tracks: Track[];
  updateFrequency: null;
  updateTime: number;
  userId: number;
  videoIds: null;
  videos: null;
}

export interface LyricContent {
  version: number;
  lyric: string;
}

export interface LyricUser {
  demand: number;
  id: number;
  nickname: string;
  status: number;
  uptime: number;
  userid: number;
}

export interface Lyric {
  lrc?: LyricContent;
  klyric?: LyricContent;
  tlyric?: LyricContent;
  lyricUser?: LyricUser;
  transUser?: LyricUser;
  qfy: boolean;
  sfy: boolean;
  sgc: boolean;
}
