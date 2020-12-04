import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MessageModule} from "@src/app/modules/message/message.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {BullsAndCowsComponent} from "./bulls-and-cows.component";

describe("BullsAndCowsComponent", () => {
    let component: BullsAndCowsComponent;
    let fixture: ComponentFixture<BullsAndCowsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BullsAndCowsComponent],
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatCardModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MessageModule,
                PerfectScrollbarModule
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BullsAndCowsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
