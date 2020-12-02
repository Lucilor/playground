import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ChatComponent} from "./components/chat/chat.component";
import {MatButtonModule} from "@angular/material/button";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

@NgModule({
    declarations: [ChatComponent],
    imports: [CommonModule, MatButtonModule, PerfectScrollbarModule]
})
export class AIModule {}
