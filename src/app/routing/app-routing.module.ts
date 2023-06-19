import {NgModule} from "@angular/core";
import {Route, RouterModule, Routes} from "@angular/router";
import {PageNotFoundComponent} from "@views/page-not-found/page-not-found.component";
import {pathResolver} from "./path-resolver";
import {routesInfo} from "./routes-info";

export type RouteInfo = Route & {path: string; children?: RouteInfo[]; data?: {hiddinInIndex?: boolean; beta?: boolean; isOuter?: boolean}};

const routes: Routes = [
  {path: "", pathMatch: "full", redirectTo: routesInfo[0].path},
  ...routesInfo,
  {path: "**", component: PageNotFoundComponent, resolve: {redirect: pathResolver}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
