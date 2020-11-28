import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatTooltipModule} from "@angular/material/tooltip";
import {HttpModule} from "@src/app/modules/http/http.module";
import {MessageModule} from "@src/app/modules/message/message.module";
import {MusicPlayerComponent} from "./music-player.component";

describe("MusicPlayerComponent", () => {
    let component: MusicPlayerComponent;
    let fixture: ComponentFixture<MusicPlayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MusicPlayerComponent],
            imports: [HttpModule, MatTooltipModule, MessageModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MusicPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
