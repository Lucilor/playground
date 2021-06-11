import {CommonModule} from "@angular/common";
import {Injectable, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatSelectModule} from "@angular/material/select";
import {MatTooltipModule} from "@angular/material/tooltip";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpModule} from "@modules/http/http.module";
import {ImageModule} from "@modules/image/image.module";
import {MessageModule} from "@modules/message/message.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {NgxUiLoaderModule} from "ngx-ui-loader";
import {MusicPlayerComponent} from "./components/music-player/music-player.component";
import {MusicPlayerRoutingModule} from "./music-player-routing.module";
import {HomeComponent} from "./views/home/home.component";
import {LoginComponent} from "./views/login/login.component";

@Injectable()
export class MyMatPaginatorIntl extends MatPaginatorIntl {
    itemsPerPageLabel = "每页条数";
    previousPageLabel = "上一页";
    nextPageLabel = "下一页";
    firstPageLabel = "首页";
    lastPageLabel = "尾页";

    getRangeLabel = (page: number, pageSize: number, length: number) => {
        const totalPage = Math.ceil(length / pageSize);
        return `第${page + 1}页，共${totalPage}页`;
    };
}

@NgModule({
    declarations: [MusicPlayerComponent, LoginComponent, HomeComponent],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpModule,
        ImageModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatPaginatorModule,
        MatSelectModule,
        MatTooltipModule,
        MessageModule,
        MusicPlayerRoutingModule,
        NgxUiLoaderModule,
        PerfectScrollbarModule,
        ReactiveFormsModule
    ],
    exports: [MusicPlayerComponent],
    providers: [{provide: MatPaginatorIntl, useClass: MyMatPaginatorIntl}]
})
export class MusicPlayerModule {}
