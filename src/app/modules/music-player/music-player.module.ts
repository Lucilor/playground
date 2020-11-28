import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MusicPlayerComponent} from "./components/music-player/music-player.component";
import {HttpModule} from "../http/http.module";
import {NeteaseMusicComponent} from "./views/netease-music/netease-music.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ImageModule} from "../image/image.module";

@NgModule({
    declarations: [MusicPlayerComponent, NeteaseMusicComponent],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpModule,
        ImageModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    exports: [MusicPlayerComponent]
})
export class MusicPlayerModule {}
