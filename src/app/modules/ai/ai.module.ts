import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ChatComponent} from "./components/chat/chat.component";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {ImageModule} from "../image/image.module";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [ChatComponent],
  imports: [CommonModule, FormsModule, ImageModule, MatButtonModule, MatIconModule, NgScrollbarModule]
})
export class AIModule {}
