import {ComponentFixture, TestBed} from "@angular/core/testing";

import {ChinesePoetryComponent} from "./chinese-poetry.component";

describe("ChinesePoetryComponent", () => {
	let component: ChinesePoetryComponent;
	let fixture: ComponentFixture<ChinesePoetryComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChinesePoetryComponent]
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
