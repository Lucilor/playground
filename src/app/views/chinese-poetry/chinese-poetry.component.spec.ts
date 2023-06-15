import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatPaginatorModule} from "@angular/material/paginator";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {SpinnerModule} from "@modules/spinner/spinner.module";
import {NgScrollbarModule} from "ngx-scrollbar";
import {ChinesePoetryComponent} from "./chinese-poetry.component";

describe("ChinesePoetryComponent", () => {
  let component: ChinesePoetryComponent;
  let fixture: ComponentFixture<ChinesePoetryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChinesePoetryComponent],
      imports: [HttpModule, MatExpansionModule, MatPaginatorModule, MessageModule, NgScrollbarModule, SpinnerModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChinesePoetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
