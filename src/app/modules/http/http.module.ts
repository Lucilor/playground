import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RouterModule} from "@angular/router";
import {NgxUiLoaderHttpModule} from "ngx-ui-loader";
import {MessageModule} from "../message/message.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, BrowserAnimationsModule, RouterModule.forRoot([]), MessageModule, NgxUiLoaderHttpModule]
})
export class HttpModule {}
