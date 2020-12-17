import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {paths} from "./app.common";
import {ChatComponent} from "./modules/ai/components/chat/chat.component";
import {NeteaseMusicComponent} from "./modules/music-player/views/netease-music/netease-music.component";
import {PathResolveService} from "./services/path-resolve.service";
import {BezierComponent} from "./views/bezier/bezier.component";
import {BlogComponent} from "./views/blog/blog.component";
import {BullsAndCowsComponent} from "./views/bulls-and-cows/bulls-and-cows.component";
import {ChinesePoetryComponent} from "./views/chinese-poetry/chinese-poetry.component";
import {IndexComponent} from "./views/index/index.component";
import {PageNotFoundComponent} from "./views/page-not-found/page-not-found.component";
import {RubiksCubeComponent} from "./views/rubiks-cube/rubiks-cube.component";

const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: paths.index},
    {path: paths.bezier, component: BezierComponent},
    {path: paths.chinesePoetry, component: ChinesePoetryComponent},
    {path: paths.index, component: IndexComponent},
    {path: paths.rubiksCube, component: RubiksCubeComponent},
    {path: paths.neteaseMusic, component: NeteaseMusicComponent},
    {path: paths.neteaseMusic, component: NeteaseMusicComponent},
    {path: paths.chat, component: ChatComponent},
    {path: paths.bullsAndCows, component: BullsAndCowsComponent},
    {path: paths.blog, component: BlogComponent},
    {path: "**", component: PageNotFoundComponent, resolve: {redirect: PathResolveService}}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
