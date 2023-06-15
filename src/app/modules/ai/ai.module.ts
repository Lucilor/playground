import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {NgScrollbarModule} from "ngx-scrollbar";
import {ImageModule} from "../image/image.module";
import {ChatComponent} from "./components/chat/chat.component";

@NgModule({
  declarations: [ChatComponent],
  imports: [CommonModule, FormsModule, ImageModule, MatButtonModule, MatIconModule, NgScrollbarModule]
})
export class AIModule {}
