import {DragDropModule} from "@angular/cdk/drag-drop";
import {Injectable, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BullsAndCowsDifficultyComponent} from "@components/dialogs/bulls-and-cows-difficulty/bulls-and-cows-difficulty.component";
import {ChineseChessCollectionsComponent} from "@components/dialogs/chinese-chess-collections/chinese-chess-collections.component";
import {ChinesePoetrySearchComponent} from "@components/dialogs/chinese-poetry-search/chinese-poetry-search.component";
import {MenuComponent} from "@components/menu/menu.component";
import {AIModule} from "@modules/ai/ai.module";
import {HttpModule} from "@modules/http/http.module";
import {ImageModule} from "@modules/image/image.module";
import {MessageModule} from "@modules/message/message.module";
import {MusicPlayerModule} from "@modules/music-player/music-player.module";
import {SpinnerModule} from "@modules/spinner/spinner.module";
import {BezierComponent} from "@views/bezier/bezier.component";
import {BullsAndCowsComponent} from "@views/bulls-and-cows/bulls-and-cows.component";
import {ChineseChessComponent} from "@views/chinese-chess/chinese-chess.component";
import {ChinesePoetryComponent} from "@views/chinese-poetry/chinese-poetry.component";
import {DddjComponent} from "@views/dddj/dddj.component";
import {IndexComponent} from "@views/index/index.component";
import {PageNotFoundComponent} from "@views/page-not-found/page-not-found.component";
import {RubiksCubeComponent} from "@views/rubiks-cube/rubiks-cube.component";
import {ThuumComponent} from "@views/thuum/thuum.component";
import {ColorChromeModule} from "ngx-color/chrome";
import {NgScrollbarModule} from "ngx-scrollbar";
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";

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
    declarations: [
        AppComponent,
        BezierComponent,
        BullsAndCowsComponent,
        BullsAndCowsDifficultyComponent,
        ChineseChessCollectionsComponent,
        ChineseChessComponent,
        ChinesePoetryComponent,
        ChinesePoetrySearchComponent,
        DddjComponent,
        IndexComponent,
        MenuComponent,
        PageNotFoundComponent,
        RubiksCubeComponent,
        ThuumComponent
    ],
    imports: [
        AIModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ColorChromeModule,
        DragDropModule,
        FormsModule,
        HttpModule,
        ImageModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
        MessageModule,
        MusicPlayerModule,
        NgScrollbarModule,
        ReactiveFormsModule,
        SpinnerModule
    ],
    providers: [{provide: MatPaginatorIntl, useClass: MyMatPaginatorIntl}],
    bootstrap: [AppComponent]
})
export class AppModule {}
