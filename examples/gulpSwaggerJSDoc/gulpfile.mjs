import gulp from "gulp";
import { deleteAsync } from "del";
import { gulpSwaggerJSDoc } from "../../index.js";
import config from "./src/config.js"

async function buildJSDoc(done) {
  const outUrl = "./dist";
  await deleteAsync(outUrl);
  gulpSwaggerJSDoc(config).pipe(gulp.dest(outUrl));
  gulp.src("./src/**/*.js").pipe(gulp.dest(outUrl));
  if (done) done();
}

export const build = gulp.series(buildJSDoc);
