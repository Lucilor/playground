import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MenuComponent} from "@src/app/components/menu/menu.component";
import {ColorChromeModule} from "ngx-color/chrome";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {RubiksCubeComponent} from "./rubiks-cube.component";

describe("RubiksCubeComponent", () => {
    let component: RubiksCubeComponent;
    let fixture: ComponentFixture<RubiksCubeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RubiksCubeComponent, MenuComponent],
            imports: [
                BrowserAnimationsModule,
                ColorChromeModule,
                FormsModule,
                MatExpansionModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatMenuModule,
                PerfectScrollbarModule,
                ReactiveFormsModule
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RubiksCubeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
