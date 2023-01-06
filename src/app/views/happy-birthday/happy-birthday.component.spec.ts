import {ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {HttpModule} from "@modules/http/http.module";

import {HappyBirthdayComponent} from "./happy-birthday.component";

describe("HappyBirthdayComponent", () => {
  let component: HappyBirthdayComponent;
  let fixture: ComponentFixture<HappyBirthdayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HappyBirthdayComponent],
      imports: [HttpModule, RouterModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HappyBirthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
