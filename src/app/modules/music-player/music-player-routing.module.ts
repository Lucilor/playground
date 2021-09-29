import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {LoginGuard} from "./guards/login.guard";
import {HomeComponent} from "./views/home/home.component";
import {LoginComponent} from "./views/login/login.component";

const routes: Routes = [
    {
        path: "",
        children: [
            {path: "", pathMatch: "full", redirectTo: "home"},
            {path: "home", component: HomeComponent}
        ],
        canActivate: [LoginGuard]
    },
    {path: "login", component: LoginComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MusicPlayerRoutingModule {}
