import {ObjectOf} from "@lucilor/utils";
import axios from "axios";
import child_process from "child_process";
import FormData from "form-data";
import fs from "fs";
import gulp from "gulp";
import zip from "gulp-zip";
import {jsonc} from "jsonc";
import minimist from "minimist";
import path from "path";
// import urljoin from "url-join";
const urljoin = (...aaa: string[]) => aaa.join("/");

const configPath = "./gulp.config.json";
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
        configPath,
        jsonc.stringify(
            {
                $schema: "./.schemas/gulp.config.schema.json",
                host: "",
                token: "",
                targetDir: ""
            },
            {space: 4}
        )
    );
}
const {host, token, targetDir} = jsonc.parse(fs.readFileSync("./gulp.config.json").toString());

const postFormData = (url: string, data: ObjectOf<any>) => {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return axios.post(url, formData, {
        headers: {...formData.getHeaders(), Cookie: `token=${token}`},
        maxBodyLength: Infinity,
        withCredentials: true
    });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const args = minimist(process.argv.slice(2));
const tmpDir = "./.tmp";
const zipName = "upload.zip";

gulp.task("build", () => child_process.exec("npm run build"));

gulp.task("zip", () => {
    const globs = ["./dist/**/*"];
    return gulp.src(globs, {dot: true, cwd: targetDir, base: targetDir}).pipe(zip(zipName)).pipe(gulp.dest(tmpDir));
});

gulp.task("upload", async () => {
    const url = urljoin(host, "playground/upload");
    const data: ObjectOf<any> = {token, file: fs.createReadStream(path.join(tmpDir, zipName))};
    const response = await postFormData(url, data);
    console.log(response.data);
});

gulp.task("default", gulp.series("build", "zip", "upload"));
