import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {HttpModule} from "@src/app/modules/http/http.module";

import {NeteaseMusicComponent} from "./netease-music.component";

describe("NeteaseMusicComponent", () => {
    let component: NeteaseMusicComponent;
    let fixture: ComponentFixture<NeteaseMusicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NeteaseMusicComponent],
            imports: [FormsModule, HttpModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NeteaseMusicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
