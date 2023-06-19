import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {DddjGiftsComponent} from "./dddj-gifts.component";

describe("DddjGiftsComponent", () => {
  let component: DddjGiftsComponent;
  let fixture: ComponentFixture<DddjGiftsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DddjGiftsComponent],
      imports: [HttpModule, MessageModule]
    });
    fixture = TestBed.createComponent(DddjGiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
