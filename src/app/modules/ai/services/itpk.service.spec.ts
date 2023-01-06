import {TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {ItpkService} from "./itpk.service";

describe("ItpkService", () => {
  let service: ItpkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, MessageModule]
    });
    service = TestBed.inject(ItpkService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
