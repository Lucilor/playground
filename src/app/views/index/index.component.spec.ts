import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {IndexComponent} from "./index.component";

describe("IndexComponent", () => {
    let component: IndexComponent;
    let fixture: ComponentFixture<IndexComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IndexComponent],
            imports: [HttpModule, MatButtonModule, MatDividerModule, MessageModule, RouterTestingModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IndexComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
