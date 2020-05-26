import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {BezierDrawer} from "./bezier-drawer/bezier-drawer";
import {Vector2} from "three";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
	selector: "app-bezier",
	templateUrl: "./bezier.component.html",
	styleUrls: ["./bezier.component.scss"]
})
export class BezierComponent implements AfterViewInit {
	@ViewChild("container", {read: ElementRef}) container: ElementRef<HTMLElement>;
	drawer: BezierDrawer;
	ctrlPoints: Vector2[] = [];
	miniMenu = false;
	get points() {
		return this.drawer?.curve.ctrlPoints || [];
	}
	constructor() {
		const drawer = new BezierDrawer({
			width: innerWidth,
			height: innerHeight,
			duration: 1000,
			backgroundColor: 0xffffff
		});
		// tslint:disable-next-line: no-string-literal
		window["drawer"] = drawer;
		this.drawer = drawer;
	}

	ngAfterViewInit() {
		this.container.nativeElement.append(this.drawer.dom);
		window.addEventListener("resize", () => {
			this.drawer.resize(innerWidth, innerHeight);
		});
	}

	getPointNum(point: Vector2, axis: "x" | "y") {
		return point[axis].toFixed(2);
	}

	setPointNum(event: InputEvent, point: Vector2, axis: "x" | "y") {
		const value = (event.target as HTMLInputElement).value;
		point[axis] = Number(value);
		this.drawer.start();
	}

	toggleLoop(event: MatSlideToggleChange) {
		this.drawer.loop = event.checked;
	}

	reset() {
		this.drawer.curve.ctrlPoints = [];
		this.drawer.start();
	}
}
