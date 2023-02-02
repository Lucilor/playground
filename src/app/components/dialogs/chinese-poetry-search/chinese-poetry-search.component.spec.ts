import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MessageModule} from "@modules/message/message.module";
import {NgScrollbarModule} from "ngx-scrollbar";

import {ChinesePoetrySearchComponent} from "./chinese-poetry-search.component";

describe("ChinesePoetrySearchComponent", () => {
  let component: ChinesePoetrySearchComponent;
  let fixture: ComponentFixture<ChinesePoetrySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChinesePoetrySearchComponent],
      imports: [BrowserAnimationsModule, FormsModule, MatFormFieldModule, MatInputModule, MessageModule, NgScrollbarModule],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChinesePoetrySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
