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
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTabsModule} from "@angular/material/tabs";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ColorChromeModule} from "ngx-color/chrome";
import {PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG} from "ngx-perfect-scrollbar";
import {NgxUiLoaderModule, SPINNER} from "ngx-ui-loader";
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {BullsAndCowsDifficultyComponent} from "./components/dialogs/bulls-and-cows-difficulty/bulls-and-cows-difficulty.component";
import {ChinesePoetrySearchComponent} from "./components/dialogs/chinese-poetry-search/chinese-poetry-search.component";
import {MenuComponent} from "./components/menu/menu.component";
import {AIModule} from "./modules/ai/ai.module";
import {EditorModule} from "./modules/editor/editor.module";
import {HttpModule} from "./modules/http/http.module";
import {MessageModule} from "./modules/message/message.module";
import {MusicPlayerModule} from "./modules/music-player/music-player.module";
import {BezierComponent} from "./views/bezier/bezier.component";
import {BlogComponent} from "./views/blog/blog.component";
import {BullsAndCowsComponent} from "./views/bulls-and-cows/bulls-and-cows.component";
import {ChineseChessComponent} from "./views/chinese-chess/chinese-chess.component";
import {ChinesePoetryComponent} from "./views/chinese-poetry/chinese-poetry.component";
import {IndexComponent} from "./views/index/index.component";
import {PageNotFoundComponent} from "./views/page-not-found/page-not-found.component";
import {RubiksCubeComponent} from "./views/rubiks-cube/rubiks-cube.component";

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

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
};

@NgModule({
    declarations: [
        AppComponent,
        BezierComponent,
        ChinesePoetryComponent,
        ChinesePoetrySearchComponent,
        IndexComponent,
        MenuComponent,
        RubiksCubeComponent,
        BullsAndCowsComponent,
        BullsAndCowsDifficultyComponent,
        BlogComponent,
        PageNotFoundComponent,
        ChineseChessComponent
    ],
    imports: [
        AIModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ColorChromeModule,
        DragDropModule,
        EditorModule,
        FormsModule,
        HttpModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MessageModule,
        MusicPlayerModule,
        NgxUiLoaderModule.forRoot({
            fgsColor: "#2196f3",
            bgsColor: "#2196f3",
            pbColor: "#2196f3",
            fgsType: SPINNER.threeStrings,
            bgsType: SPINNER.ballScaleMultiple
        }),
        PerfectScrollbarModule,
        ReactiveFormsModule
    ],
    providers: [
        {provide: MatPaginatorIntl, useClass: MyMatPaginatorIntl},
        {provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
