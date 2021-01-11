import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MessageModule} from "@src/app/modules/message/message.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {ChineseChessBoard} from "../../chinese-chess/chinese-chess";

import {ChineseChessCollection, ChineseChessCollectionComponent} from "./chinese-chess-collection.component";

const data: ChineseChessCollection = {
    name: "test",
    desc: "test-desc",
    boards: [{name: "test", desc: "test-desc", info: new ChineseChessBoard().save()}]
};

describe("ChineseChessCollectionComponent", () => {
    let component: ChineseChessCollectionComponent;
    let fixture: ComponentFixture<ChineseChessCollectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChineseChessCollectionComponent],
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                MessageModule,
                PerfectScrollbarModule
            ],
            providers: [
                {provide: MatDialogRef, useValue: {}},
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: data
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChineseChessCollectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
