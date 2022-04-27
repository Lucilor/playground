import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {SpinnerModule} from "@modules/spinner/spinner.module";
import {NgxUiLoaderModule} from "ngx-ui-loader";
import {MusicPlayerComponent} from "./music-player.component";

describe("MusicPlayerComponent", () => {
    let component: MusicPlayerComponent;
    let fixture: ComponentFixture<MusicPlayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MusicPlayerComponent],
            imports: [HttpModule, NgxUiLoaderModule, SpinnerModule]
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
