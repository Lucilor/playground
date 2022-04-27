import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatSelectModule} from "@angular/material/select";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {SpinnerModule} from "@modules/spinner/spinner.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgScrollbarModule} from "ngx-scrollbar";
import {NgxUiLoaderModule} from "ngx-ui-loader";
import {PlaylistsComponent} from "./playlists.component";

describe("PlaylistsComponent", () => {
    let component: PlaylistsComponent;
    let fixture: ComponentFixture<PlaylistsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlaylistsComponent],
            imports: [
                HttpModule,
                InfiniteScrollModule,
                MatIconModule,
                MatListModule,
                MatMenuModule,
                MatSelectModule,
                MessageModule,
                NgScrollbarModule,
                NgxUiLoaderModule,
                SpinnerModule
            ]
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
