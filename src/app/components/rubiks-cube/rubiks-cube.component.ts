import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {RubiksCubeDrawer} from "./rubiks-cube-drawer/rubiks-cube-drawer";
import {RubiksCube} from "./rubiks-cube-drawer/rubiks-cube";

@Component({
	selector: "app-rubiks-cube",
	templateUrl: "./rubiks-cube.component.html",
	styleUrls: ["./rubiks-cube.component.scss"]
})
export class RubiksCubeComponent implements AfterViewInit {
	@ViewChild("container", {read: ElementRef}) container: ElementRef<HTMLElement>;
	drawer: RubiksCubeDrawer;
	cube: RubiksCube;
	constructor() {
		const cube = new RubiksCube(5, 3);
		const drawer = new RubiksCubeDrawer(cube, {width: innerWidth, height: innerHeight});
		// tslint:disable-next-line: no-string-literal
		window["drawer"] = drawer;
		// tslint:disable-next-line: no-string-literal
		window["cube"] = cube;
		this.drawer = drawer;
		this.cube = cube;
	}

	ngAfterViewInit() {
		this.container.nativeElement.appendChild(this.drawer.dom);
	}
}
