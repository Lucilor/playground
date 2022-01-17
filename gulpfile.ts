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

const postFormData = (url: string, data: ObjectOf<any>, file?: fs.ReadStream) => {
    const formData = new FormData();
    if (file) {
        formData.append("file", file);
    }
    return axios.post(url, formData, {headers: formData.getHeaders(), maxBodyLength: Infinity});
};

const configPath = "./gulp.config.json";
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
        configPath,
        jsonc.stringify(
            {
                $schema: "./.schemas/gulp.config.schema.json",
                host: "https://candypurity.com",
                token: ""
            },
            {space: 4}
        )
    );
}
const {host, token} = jsonc.parse(fs.readFileSync("./gulp.config.json").toString());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const args = minimist(process.argv.slice(2));
const distDir = "./dist";
const tmpDir = "./.tmp";
const zipName = "upload.zip";

gulp.task("build", () => child_process.exec("npm run build"));

gulp.task("zip", () => {
    const globs = ["**/*"];
    return gulp.src(globs, {dot: true, cwd: distDir, base: distDir}).pipe(zip(zipName)).pipe(gulp.dest(tmpDir));
});

gulp.task("upload", async () => {
    const url = host + "/update-playground.php";
    if (url.includes("localhost")) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    const data = {token};
    const response = await postFormData(url, data, fs.createReadStream(path.join(tmpDir, zipName)));
    console.log(response.data);
});

gulp.task("default", gulp.series("build", "zip", "upload"));
