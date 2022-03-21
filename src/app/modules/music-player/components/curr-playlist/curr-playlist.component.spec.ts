import {ComponentFixture, TestBed} from "@angular/core/testing";

import {CurrPlaylistComponent} from "./curr-playlist.component";

describe("CurrPlaylistComponent", () => {
    let component: CurrPlaylistComponent;
    let fixture: ComponentFixture<CurrPlaylistComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CurrPlaylistComponent]
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
