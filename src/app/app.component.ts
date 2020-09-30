import {Component} from "@angular/core";
import {POSITION, SPINNER} from "ngx-ui-loader";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	SPINNER = SPINNER;
	POSITION = POSITION;

	title = "playground";
}
