import {TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {MusicService} from "./music.service";

describe("MusicPlayerService", () => {
    let service: MusicService;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpModule]});
        service = TestBed.inject(MusicService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
