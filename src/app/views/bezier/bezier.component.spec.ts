import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MenuComponent} from "@components/menu/menu.component";
import {NgScrollbarModule} from "ngx-scrollbar";
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
                MatSelectModule,
                MatSlideToggleModule,
                NgScrollbarModule
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
