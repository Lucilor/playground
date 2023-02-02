import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {CurrPlaylistComponent} from "./curr-playlist.component";

describe("CurrPlaylistComponent", () => {
  let component: CurrPlaylistComponent;
  let fixture: ComponentFixture<CurrPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrPlaylistComponent],
      imports: [HttpModule, MessageModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
