import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";
import {ColorEvent} from "ngx-color";
import {Color} from "three";
import {RubiksCube, RubiksCubeColors} from "./rubiks-cube-drawer/rubiks-cube";
import {RubiksCubeDrawer} from "./rubiks-cube-drawer/rubiks-cube-drawer";

export class MyErrorStateMatcher implements ErrorStateMatcher {
    errorMsg = "";
    isErrorState(): boolean {
        return this.errorMsg.length > 0;
    }
}

@Component({
    selector: "app-rubiks-cube",
    templateUrl: "./rubiks-cube.component.html",
    styleUrls: ["./rubiks-cube.component.scss"]
})
export class RubiksCubeComponent implements AfterViewInit {
    @ViewChild("container", {read: ElementRef}) container?: ElementRef<HTMLElement>;
    drawer: RubiksCubeDrawer;
    cube: RubiksCube;
    cubeColors: {key: keyof RubiksCubeColors; name: string}[] = [
        {key: "F", name: "前面"},
        {key: "B", name: "后面"},
        {key: "U", name: "上面"},
        {key: "D", name: "下面"},
        {key: "L", name: "左面"},
        {key: "R", name: "右面"}
    ];
    commandFormControl = new FormControl("");
    matcher = new MyErrorStateMatcher();
    colorIdx = -1;

    constructor() {
        const cube = new RubiksCube(5, 3);
        const drawer = new RubiksCubeDrawer(cube, {width: innerWidth, height: innerHeight});
        Object.assign(window, {drawer, cube});
        this.drawer = drawer;
        this.cube = cube;
    }

    ngAfterViewInit() {
        if (this.container) {
            this.container.nativeElement.appendChild(this.drawer.dom);
        }
        window.addEventListener("resize", () => {
            this.drawer.resize(innerWidth, innerHeight);
        });
    }

    changeSize(event: Event) {
        const size = Number((event.target as HTMLInputElement).value);
        this.cube.size = size;
        this.cube.reset();
    }

    changeDimension(event: Event) {
        const dimension = Number((event.target as HTMLInputElement).value);
        this.cube.dimension = dimension;
        this.cube.reset();
    }

    getColor() {
        if (this.colorIdx < 0) {
            return "";
        }
        const key = this.cubeColors[this.colorIdx].key;
        return "#" + this.cube.colors[key].getHexString();
    }

    setColor(event: ColorEvent) {
        if (this.colorIdx < 0) {
            return;
        }
        const key = this.cubeColors[this.colorIdx].key;
        this.cube.colors[key] = new Color(event.color.hex);
        this.cube.reset();
    }

    execute(event?: KeyboardEvent) {
        if (!event || (event && event.key === "Enter")) {
            try {
                this.cube.execute(this.commandFormControl.value);
                this.matcher.errorMsg = "";
            } catch (error) {
                this.matcher.errorMsg = (error as Error).message;
            }
        }
    }
}
