import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {ChatComponent} from "@modules/ai/components/chat/chat.component";
import {PathResolveService} from "@services/path-resolve.service";
import {BezierComponent} from "@views/bezier/bezier.component";
import {BlogComponent} from "@views/blog/blog.component";
import {BullsAndCowsComponent} from "@views/bulls-and-cows/bulls-and-cows.component";
import {ChineseChessComponent} from "@views/chinese-chess/chinese-chess.component";
import {ChinesePoetryComponent} from "@views/chinese-poetry/chinese-poetry.component";
import {IndexComponent} from "@views/index/index.component";
import {PageNotFoundComponent} from "@views/page-not-found/page-not-found.component";
import {RubiksCubeComponent} from "@views/rubiks-cube/rubiks-cube.component";
import {ThuumComponent} from "@views/thuum/thuum.component";
import {routesInfo} from "./app.common";

const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: routesInfo.index.path},
    {path: routesInfo.bezier.path, component: BezierComponent},
    {path: routesInfo.chinesePoetry.path, component: ChinesePoetryComponent},
    {path: routesInfo.index.path, component: IndexComponent},
    {path: routesInfo.rubiksCube.path, component: RubiksCubeComponent},
    {path: routesInfo.chat.path, component: ChatComponent},
    {path: routesInfo.bullsAndCows.path, component: BullsAndCowsComponent},
    {path: routesInfo.blog.path, component: BlogComponent},
    {path: routesInfo.chineseChess.path, component: ChineseChessComponent},
    {path: routesInfo.thuum.path, component: ThuumComponent},
    {
        path: "wyyyy",
        loadChildren: () => import("./modules/music-player/music-player-routing.module").then((m) => m.MusicPlayerRoutingModule)
    },
    {path: "**", component: PageNotFoundComponent, resolve: {redirect: PathResolveService}}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
