import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {MatSelectChange} from "@angular/material/select";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {local} from "@app/app.common";
import {Point} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {Vector2} from "three";
import {BezierDrawer} from "./bezier-drawer/bezier-drawer";

@Component({
  selector: "app-bezier",
  templateUrl: "./bezier.component.html",
  styleUrls: ["./bezier.component.scss"]
})
export class BezierComponent extends AppStorage() implements AfterViewInit {
  @ViewChild("container", {read: ElementRef}) container?: ElementRef<HTMLElement>;
  drawer: BezierDrawer;
  ctrlPoints: Point[] = [];
  miniMenu = false;
  get points() {
    return this.drawer?.pointerPositions || [];
  }
  constructor() {
    super("bezier", local);
    const drawer = new BezierDrawer({
      width: innerWidth,
      height: innerHeight,
      duration: Number(this.load("duration")) || 1000,
      backgroundColor: 0xffffff,
      maxErrors: Number(this.load("maxErrors")) || 20,
      hidePoints: Boolean(this.load("hidePoints")) || false
    });
    (window as any).drawer = drawer;
    this.drawer = drawer;
    this.drawer.loop = Boolean(this.load("loop")) || false;
    this.drawer.mode = this.load("mode") || "ctrl";
  }

  ngAfterViewInit() {
    if (this.container) {
      this.container.nativeElement.append(this.drawer.dom);
    }
    window.addEventListener("resize", () => {
      this.drawer.resize(innerWidth, innerHeight);
    });
  }

  getPointNum(i: number, axis: "x" | "y") {
    return this.points[i][axis].toFixed(2);
  }

  setPointNum(event: Event, i: number, axis: "x" | "y") {
    const value = (event.target as HTMLInputElement).value;
    const drawer = this.drawer;
    const point = this.points[i];
    point[axis] = Number(value);
    if (drawer.mode === "ctrlPoints") {
      drawer.updateCtrlPoint(new Vector2(point.x, point.y), i);
    } else {
      drawer.updateFitPoint(new Vector2(point.x, point.y), i);
    }
    drawer.start();
  }

  removePoint(i: number) {
    const drawer = this.drawer;
    if (drawer.mode === "ctrlPoints") {
      drawer.updateCtrlPoint(null, i);
    } else {
      drawer.updateFitPoint(null, i);
    }
    drawer.start();
  }

  toggleLoop(event: MatSlideToggleChange) {
    this.drawer.loop = event.checked;
    this.save("loop", this.drawer.loop);
  }

  toggleHidePoints(event: MatSlideToggleChange) {
    this.drawer.config.hidePoints = event.checked;
    this.save("hidePoints", this.drawer.config.hidePoints);
    this.drawer.start();
  }

  reset() {
    this.drawer.reset();
  }

  changeMode(event: MatSelectChange) {
    const mode = event.value;
    this.drawer.mode = mode;
    this.save("mode", mode);
  }

  setDuration(event: Event) {
    const target = event.target as HTMLInputElement;
    this.drawer.config.duration = Number(target.value);
    this.save("duration", this.drawer.config.duration);
    this.drawer.start();
  }

  setMaxErrors(event: Event) {
    const target = event.target as HTMLInputElement;
    this.drawer.config.maxErrors = Number(target.value);
    this.save("maxErrors", this.drawer.config.maxErrors);
    this.drawer.updateFitCurve().start();
  }
}
