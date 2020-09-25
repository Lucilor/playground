import {TestBed} from "@angular/core/testing";

import {ChinesePoetryService} from "./chinese-poetry.service";

describe("ChinesePoetryService", () => {
	let service: ChinesePoetryService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ChinesePoetryService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
