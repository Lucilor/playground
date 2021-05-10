import {TestBed} from "@angular/core/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {MusicPlayerModule} from "@modules/music-player/music-player.module";
import {NgxUiLoaderModule} from "ngx-ui-loader";
import {AppComponent} from "./app.component";

describe("AppComponent", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [HttpModule, MessageModule, MusicPlayerModule, NgxUiLoaderModule, RouterTestingModule]
        }).compileComponents();
    });

    it("should create the app", () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    // it(`should have as title 'playground'`, () => {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     const app = fixture.componentInstance;
    //     expect(app.title).toEqual("playground");
    // });

    // it("should render title", () => {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();
    //     const compiled = fixture.nativeElement;
    //     expect(compiled.querySelector(".content span").textContent).toContain("playground app is running!");
    // });
});
