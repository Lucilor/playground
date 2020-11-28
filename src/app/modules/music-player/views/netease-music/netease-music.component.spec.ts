import {ComponentFixture, TestBed} from "@angular/core/testing";

import {NeteaseMusicComponent} from "./netease-music.component";

describe("NeteaseMusicComponent", () => {
    let component: NeteaseMusicComponent;
    let fixture: ComponentFixture<NeteaseMusicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NeteaseMusicComponent]
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
