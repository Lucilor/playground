import {ComponentFixture, TestBed} from "@angular/core/testing";

import {ChinesePoetrySearchComponent} from "./chinese-poetry-search.component";

describe("ChinesePoetrySearchComponent", () => {
	let component: ChinesePoetrySearchComponent;
	let fixture: ComponentFixture<ChinesePoetrySearchComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChinesePoetrySearchComponent]
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
