import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatListModule} from "@angular/material/list";
import {MatSelectModule} from "@angular/material/select";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {NgxUiLoaderModule} from "ngx-ui-loader";
import {PlaylistsComponent} from "./playlists.component";

describe("PlaylistsComponent", () => {
    let component: PlaylistsComponent;
    let fixture: ComponentFixture<PlaylistsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlaylistsComponent],
            imports: [HttpModule, MatListModule, MatSelectModule, MessageModule, NgxUiLoaderModule, PerfectScrollbarModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlaylistsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
