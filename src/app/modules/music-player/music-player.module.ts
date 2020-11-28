import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MusicPlayerComponent} from "./components/music-player/music-player.component";
import {HttpModule} from "../http/http.module";
import { NeteaseMusicComponent } from './views/netease-music/netease-music.component';

@NgModule({
    declarations: [MusicPlayerComponent, NeteaseMusicComponent],
    imports: [CommonModule, HttpModule],
    exports: [MusicPlayerComponent]
})
export class MusicPlayerModule {}
