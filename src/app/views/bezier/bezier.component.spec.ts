import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MenuComponent} from "@src/app/components/menu/menu.component";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {BezierComponent} from "./bezier.component";

describe("BezierComponent", () => {
    let component: BezierComponent;
    let fixture: ComponentFixture<BezierComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BezierComponent, MenuComponent],
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatExpansionModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatSlideToggleModule,
                PerfectScrollbarModule
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BezierComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
