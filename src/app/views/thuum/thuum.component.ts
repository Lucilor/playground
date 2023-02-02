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
  charClass: string[];
  charStyle: CSS.Properties;
  layerClass: string[];
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
  thuumClass: string[] = [];
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
      charClass: ["fade-in"],
      charStyle: {
        "--anim-duration": `${charDuration}ms`,
        "--anim-delay": `${charDuration * i}ms`
      } as CSS.Properties,
      layerClass: ["slide-out"],
      layerStyle: {
        "--anim-duration": `${charDuration}ms`,
        "--anim-delay": `${charDuration * i}ms`
      } as CSS.Properties
    }));
    const charsDuration = this.thuumChars.length * charDuration;
    await timeout(charsDuration);
    this.thuumClass = ["show-thuum"];
    this.thuumStyle = {
      "--anim-duration": `${mainDuration}ms`,
      "--anim-delay": "0"
    } as CSS.Properties;
    await timeout(mainDuration);
    this.thuumClass = [];
    this.thuumChars.forEach((v, i) => {
      v.charClass = ["fade-out"];
      v.charStyle = {
        "--anim-duration": `${charDuration}ms`,
        "--anim-delay": `${charDuration * i}ms`
      } as CSS.Properties;
      v.layerClass = ["slide-out"];
      v.layerStyle = {
        "--anim-duration": `${charDuration}ms`,
        "--anim-delay": `${charDuration * i}ms`
      } as CSS.Properties;
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
