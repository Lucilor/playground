import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatTabsModule} from "@angular/material/tabs";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {DddjComponent} from "./dddj.component";

describe("DddjComponent", () => {
    let component: DddjComponent;
    let fixture: ComponentFixture<DddjComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DddjComponent],
            imports: [HttpModule, MatTabsModule, MessageModule]
        }).compileComponents();

        fixture = TestBed.createComponent(DddjComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
