import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {RubiksCubeDrawer} from "./rubiks-cube-drawer/rubiks-cube-drawer";
import {RubiksCube} from "./rubiks-cube-drawer/rubiks-cube";
import {ColorPickerEventArgs} from "@syncfusion/ej2-angular-inputs";
import {Color} from "three";

@Component({
	selector: "app-rubiks-cube",
	templateUrl: "./rubiks-cube.component.html",
	styleUrls: ["./rubiks-cube.component.scss"]
})
export class RubiksCubeComponent implements AfterViewInit {
	@ViewChild("container", {read: ElementRef}) container: ElementRef<HTMLElement>;
	drawer: RubiksCubeDrawer;
	cube: RubiksCube;
	cubeColors = [
		{key: "F", name: "front"},
		{key: "B", name: "back"},
		{key: "U", name: "up"},
		{key: "D", name: "down"},
		{key: "L", name: "left"},
		{key: "R", name: "right"}
	];

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
		window.addEventListener("resize", () => {
			this.drawer.resize(innerWidth, innerHeight);
		});
	}

	changeSize(event: InputEvent) {
		const size = Number((event.target as HTMLInputElement).value);
		this.cube.size = size;
		this.cube.reset();
	}

	changeDimension(event: InputEvent) {
		const dimension = Number((event.target as HTMLInputElement).value);
		this.cube.dimension = dimension;
		this.cube.reset();
	}

	changeColor(event: ColorPickerEventArgs, key: string) {
		this.cube.colors[key] = new Color(event.currentValue.hex);
		this.cube.reset();
	}
}
