import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {paths} from "./app.common";
import {IndexComponent} from "./components/index/index.component";
import {BezierComponent} from "./components/bezier/bezier.component";
import {RubiksCubeComponent} from "./components/rubiks-cube/rubiks-cube.component";
import {ChinesePoetryComponent} from "./components/chinese-poetry/chinese-poetry.component";

const routes: Routes = [
	{path: "", pathMatch: "full", redirectTo: paths.index},
	{path: paths.index, component: IndexComponent},
	{path: paths.bezier, component: BezierComponent},
	{path: paths["rubiks-cube"], component: RubiksCubeComponent},
	{path: paths["chinese-poetry"], component: ChinesePoetryComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
