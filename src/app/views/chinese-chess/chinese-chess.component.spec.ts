import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatButtonModule} from "@angular/material/button";
import {MessageModule} from "@src/app/modules/message/message.module";

import {ChineseChessComponent} from "./chinese-chess.component";

describe("ChineseChessComponent", () => {
    let component: ChineseChessComponent;
    let fixture: ComponentFixture<ChineseChessComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChineseChessComponent],
            imports: [MatButtonModule, MessageModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChineseChessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
