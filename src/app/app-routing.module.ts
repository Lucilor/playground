import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { IndexComponent } from "./components/index/index.component";
import { BezierComponent } from "./components/bezier/bezier.component";

const routes: Routes = [
	{ path: "", pathMatch: "full", redirectTo: "index" },
	{ path: "index", component: IndexComponent },
	{ path: "bezier", component: BezierComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
