import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MessageModule} from "@modules/message/message.module";
import {NgScrollbarModule} from "ngx-scrollbar";
import {ChineseChessComponent} from "./chinese-chess.component";

describe("ChineseChessComponent", () => {
    let component: ChineseChessComponent;
    let fixture: ComponentFixture<ChineseChessComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChineseChessComponent],
            imports: [
                BrowserAnimationsModule,
                MatButtonModule,
                MatIconModule,
                MatSelectModule,
                MatSlideToggleModule,
                MessageModule,
                NgScrollbarModule
            ]
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
