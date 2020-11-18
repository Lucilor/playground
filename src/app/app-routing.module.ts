import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {paths} from "./app.common";
import {BezierComponent} from "./components/views/bezier/bezier.component";
import {ChinesePoetryComponent} from "./components/views/chinese-poetry/chinese-poetry.component";
import {IndexComponent} from "./components/views/index/index.component";
import {RubiksCubeComponent} from "./components/views/rubiks-cube/rubiks-cube.component";

const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: paths.index},
    {path: paths.bezier, component: BezierComponent},
    {path: paths["chinese-poetry"], component: ChinesePoetryComponent},
    {path: paths.index, component: IndexComponent},
    {path: paths["rubiks-cube"], component: RubiksCubeComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
