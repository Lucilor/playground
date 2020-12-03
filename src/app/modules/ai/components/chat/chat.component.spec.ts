import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@src/app/modules/http/http.module";
import {ImageModule} from "@src/app/modules/image/image.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {ChatComponent} from "./chat.component";

describe("ChatComponent", () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [FormsModule, HttpModule, ImageModule, PerfectScrollbarModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
