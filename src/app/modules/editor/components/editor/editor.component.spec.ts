import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {NgxEditorModule} from "ngx-editor";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {EditorComponent} from "./editor.component";

describe("EditorComponent", () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EditorComponent],
            imports: [FormsModule, NgxEditorModule, PerfectScrollbarModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
