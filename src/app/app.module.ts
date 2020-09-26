import {BrowserModule} from "@angular/platform-browser";
import {NgModule, Injectable} from "@angular/core";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {StoreModule} from "@ngrx/store";
import {reducers, metaReducers} from "./store/reducers";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {environment} from "../environments/environment";
import {HttpClientModule} from "@angular/common/http";

import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from "@angular/material/dialog";
import {MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS} from "@angular/material/snack-bar";
import {MatPaginatorModule, MatPaginatorIntl} from "@angular/material/paginator";

import {ColorPickerModule} from "@syncfusion/ej2-angular-inputs";
import {PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG} from "ngx-perfect-scrollbar";

import {BezierComponent} from "./components/bezier/bezier.component";
import {IndexComponent} from "./components/index/index.component";
import {RubiksCubeComponent} from "./components/rubiks-cube/rubiks-cube.component";
import {MenuComponent} from "./components/menu/menu.component";
import {PageNotFoundComponent} from "./components/page-not-found/page-not-found.component";
import {LoadingComponent} from "./components/loading/loading.component";
import {MessageComponent} from "./components/message/message.component";
import {ChinesePoetryComponent} from "./components/chinese-poetry/chinese-poetry.component";
import {ChinesePoetrySearchComponent} from "./components/chinese-poetry-search/chinese-poetry-search.component";

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
		// tslint:disable-next-line: semicolon
	};
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	wheelPropagation: true
};

@NgModule({
	declarations: [
		AppComponent,
		BezierComponent,
		IndexComponent,
		RubiksCubeComponent,
		MenuComponent,
		PageNotFoundComponent,
		LoadingComponent,
		MessageComponent,
		ChinesePoetryComponent,
		ChinesePoetrySearchComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		MatExpansionModule,
		MatIconModule,
		MatDialogModule,
		MatSnackBarModule,
		MatPaginatorModule,
		DragDropModule,
		ColorPickerModule,
		PerfectScrollbarModule,
		StoreModule.forRoot(reducers, {metaReducers}),
		!environment.production ? StoreDevtoolsModule.instrument() : []
	],
	providers: [
		{provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {maxWidth: "unset"}},
		{provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000, verticalPosition: "top"}},
		{provide: MatPaginatorIntl, useClass: MyMatPaginatorIntl},
		{provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
