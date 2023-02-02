import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatTabsModule} from "@angular/material/tabs";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {CurrPlaylistComponent} from "@modules/music-player/components/curr-playlist/curr-playlist.component";
import {PlaylistsComponent} from "@modules/music-player/components/playlists/playlists.component";
import {SpinnerModule} from "@modules/spinner/spinner.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgScrollbarModule} from "ngx-scrollbar";
import {NgxUiLoaderModule} from "ngx-ui-loader";
import {HomeComponent} from "./home.component";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrPlaylistComponent, HomeComponent, PlaylistsComponent],
      imports: [
        HttpModule,
        InfiniteScrollModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatMenuModule,
        MatTabsModule,
        MessageModule,
        NgScrollbarModule,
        NgxUiLoaderModule,
        SpinnerModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
