import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {HttpModule} from "@modules/http/http.module";
import {ImageModule} from "@modules/image/image.module";
import {MessageModule} from "@modules/message/message.module";
import {NgScrollbarModule} from "ngx-scrollbar";
import {DddjGiftsComponent} from "./components/dddj-gifts/dddj-gifts.component";

@NgModule({
  declarations: [DddjGiftsComponent],
  imports: [CommonModule, HttpModule, ImageModule, MatTabsModule, MatTooltipModule, MessageModule, NgScrollbarModule]
})
export class DddjModule {}
