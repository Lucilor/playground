import {ChatComponent} from "@modules/ai/components/chat/chat.component";
import {DddjGiftsComponent} from "@modules/dddj/components/dddj-gifts/dddj-gifts.component";
import {BezierComponent} from "@views/bezier/bezier.component";
import {BullsAndCowsComponent} from "@views/bulls-and-cows/bulls-and-cows.component";
import {ChineseChessComponent} from "@views/chinese-chess/chinese-chess.component";
import {ChinesePoetryComponent} from "@views/chinese-poetry/chinese-poetry.component";
import {HappyBirthdayComponent} from "@views/happy-birthday/happy-birthday.component";
import {IndexComponent} from "@views/index/index.component";
import {RubiksCubeComponent} from "@views/rubiks-cube/rubiks-cube.component";
import {ThuumComponent} from "@views/thuum/thuum.component";
import {RouteInfo} from "./app-routing.module";

export const routesInfo: RouteInfo[] = [
  {path: "index", title: "首页", component: IndexComponent, data: {hiddinInIndex: true}},
  {path: "bezier", title: "贝塞尔曲线", component: BezierComponent},
  {path: "rubiks-cube", title: "魔方", component: RubiksCubeComponent},
  {path: "chinese-poetry", title: "古诗词", component: ChinesePoetryComponent},
  {path: "chat", title: "机器人茉莉", component: ChatComponent},
  {path: "bulls-and-cows", title: "猜数字", component: BullsAndCowsComponent},
  {path: "chinese-chess", title: "中国象棋", data: {beta: true}, component: ChineseChessComponent},
  {path: "thuum", title: "Thuum", component: ThuumComponent},
  {path: "kod", pathMatch: "full", redirectTo: "https://candypurity.com/kod", title: "网盘", data: {isOuter: true}},
  {path: "dddj", title: "带带电竞", children: [{path: "gifts", title: "带带礼物预览", component: DddjGiftsComponent}]},
  {path: "happy-birthday", title: "生日快乐", component: HappyBirthdayComponent, data: {hiddinInIndex: true}}
];
