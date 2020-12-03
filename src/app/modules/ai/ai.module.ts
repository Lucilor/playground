import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ChatComponent} from "./components/chat/chat.component";
import {MatButtonModule} from "@angular/material/button";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {FormsModule} from "@angular/forms";
import {ImageModule} from "../image/image.module";

@NgModule({
    declarations: [ChatComponent],
    imports: [CommonModule, FormsModule, ImageModule, MatButtonModule, PerfectScrollbarModule]
})
export class AIModule {}
