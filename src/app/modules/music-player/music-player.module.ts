import {CommonModule} from "@angular/common";
import {Injectable, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpModule} from "@modules/http/http.module";
import {ImageModule} from "@modules/image/image.module";
import {MessageModule} from "@modules/message/message.module";
import {SpinnerModule} from "@modules/spinner/spinner.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MusicPlayerComponent} from "./components/music-player/music-player.component";
import {PlaylistsComponent} from "./components/playlists/playlists.component";
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
    declarations: [MusicPlayerComponent, LoginComponent, HomeComponent, PlaylistsComponent],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpModule,
        ImageModule,
        InfiniteScrollModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSelectModule,
        MatTabsModule,
        MatTooltipModule,
        MessageModule,
        MusicPlayerRoutingModule,
        NgScrollbarModule,
        ReactiveFormsModule,
        SpinnerModule
    ],
    exports: [MusicPlayerComponent],
    providers: [{provide: MatPaginatorIntl, useClass: MyMatPaginatorIntl}]
})
export class MusicPlayerModule {}
