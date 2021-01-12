import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogRef} from "@angular/material/dialog";
import {HttpModule} from "@src/app/modules/http/http.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {NgxUiLoaderModule} from "ngx-ui-loader";

import {ChineseChessCollectionsComponent} from "./chinese-chess-collections.component";

describe("ChineseChessCollectionsComponent", () => {
    let component: ChineseChessCollectionsComponent;
    let fixture: ComponentFixture<ChineseChessCollectionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChineseChessCollectionsComponent],
            imports: [HttpModule, MatButtonModule, NgxUiLoaderModule, PerfectScrollbarModule],
            providers: [{provide: MatDialogRef, useValue: {}}]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChineseChessCollectionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
