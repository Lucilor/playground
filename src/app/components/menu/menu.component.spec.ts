import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatIconModule} from "@angular/material/icon";
import {NgScrollbarModule} from "ngx-scrollbar";

import {MenuComponent} from "./menu.component";

describe("MenuComponent", () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MenuComponent],
            imports: [MatIconModule, NgScrollbarModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
