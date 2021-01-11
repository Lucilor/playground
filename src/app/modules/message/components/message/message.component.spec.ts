import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {EditorModule} from "@src/app/modules/editor/editor.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {MessageComponent} from "./message.component";

describe("MessageComponent", () => {
    let component: MessageComponent;
    let fixture: ComponentFixture<MessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageComponent],
            imports: [EditorModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, PerfectScrollbarModule],
            providers: [
                {provide: MatDialogRef, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {}}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
