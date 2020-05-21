import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {RubiksCubeDrawer} from "./rubiks-cube-drawer/rubiks-cube-drawer";

@Component({
	selector: "app-rubiks-cube",
	templateUrl: "./rubiks-cube.component.html",
	styleUrls: ["./rubiks-cube.component.scss"]
})
export class RubiksCubeComponent implements AfterViewInit {
	@ViewChild("container", {read: ElementRef}) container: ElementRef<HTMLElement>;
	constructor() {}

	ngAfterViewInit() {
		const drawer = new RubiksCubeDrawer({width: innerWidth, height: innerHeight, size: 5, dimension: 3});
		// tslint:disable-next-line: no-string-literal
		window["drawer"] = drawer;
		this.container.nativeElement.appendChild(drawer.dom);
	}
}
