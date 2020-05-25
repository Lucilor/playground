import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatExpansionModule} from "@angular/material/expansion";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {BezierComponent} from "./components/bezier/bezier.component";
import {IndexComponent} from "./components/index/index.component";
import {RubiksCubeComponent} from "./components/rubiks-cube/rubiks-cube.component";
import {MenuComponent} from "./components/menu/menu.component";
import {ColorPickerModule} from "@syncfusion/ej2-angular-inputs";

@NgModule({
	declarations: [AppComponent, BezierComponent, IndexComponent, RubiksCubeComponent, MenuComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		MatExpansionModule,
		MatIconModule,
		DragDropModule,
		ColorPickerModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
