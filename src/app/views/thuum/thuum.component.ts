import {Component, OnDestroy, OnInit} from "@angular/core";
import {environment} from "@env";
import {ListRandom, timeout} from "@lucilor/utils";
import {MessageService} from "@modules/message/services/message.service";
import {AppStatusService} from "@services/app-status.service";
import CSS from "csstype";
import originThuums from "./thuums.json";

interface Thuum {
  name: string;
  translation: string;
  description: string;
}

interface ThuumChar {
  content: string;
  charStyle: CSS.Properties;
  layerStyle: CSS.Properties;
}

@Component({
  selector: "app-thuum",
  templateUrl: "./thuum.component.html",
  styleUrls: ["./thuum.component.scss"]
})
export class ThuumComponent implements OnInit, OnDestroy {
  thuumRandom = new ListRandom(originThuums);
  thuum: Thuum = this.thuumRandom.list[0];
  thuumChars: ThuumChar[] = [];
  layerStyle: CSS.Properties = {};
  animationDuration = {main: 2000, char: 360};
  thuumStyle: CSS.Properties = {};
  isProd = environment.production;

  constructor(private message: MessageService, private status: AppStatusService) {}

  ngOnInit() {
    this.loop();
    this.status.setFixedBgUrl("");
  }

  ngOnDestroy() {
    this.status.setFixedBgUrl(null);
  }

  async loop() {
    const {main: mainDuration, char: charDuration} = this.animationDuration;
    this.thuum = this.thuumRandom.next();
    this.thuumChars = this.thuum.name.split("").map((v, i) => ({
      content: v,
      charStyle: {opacity: "0", animation: `fade-in ${charDuration}ms ${charDuration * i}ms forwards`},
      layerStyle: {
        left: "unset",
        right: "0",
        width: "100%",
        animation: `slide-out ${charDuration}ms ${charDuration * i}ms forwards`
      }
    }));
    const charsDuration = this.thuumChars.length * charDuration;
    await timeout(charsDuration);
    if (!this.isProd) {
      this.thuumStyle = {animation: `show-thuum ${mainDuration}ms`};
    }
    await timeout(mainDuration);
    this.thuumStyle = {};
    this.thuumChars.forEach((v, i) => {
      v.charStyle = {opacity: "1", animation: `fade-out ${charDuration}ms ${charDuration * i}ms forwards`};
      v.layerStyle = {
        left: "0",
        right: "unset",
        width: "0",
        animation: `slide-in ${charDuration}ms ${charDuration * i}ms forwards`
      };
    });
    await timeout(charsDuration);
    this.loop();
  }

  showDetails() {
    const {name, translation, description} = this.thuum;
    this.message.alert({
      title: name,
      titleClass: "thuum-title",
      content: `${name} - ${translation}<br>${description}`
    });
  }
}
