const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const autoprefixer = require("autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es").default;
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const sync = require("browser-sync").create();

// HTML

const html = () => {
  return gulp.src("source/**.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
}

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Minified styles

const minStyles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.minStyles = minStyles;

// Images optimization

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}
exports.images = images;

// Png & jpg to webp

const webpTask = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"))
}

exports.webp = webpTask;

// Sprite

const sprite = () => {
  return gulp.src("source/img/**/sprite-*.svg")
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprites.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// JS

const js = () => {
  return gulp.src("source/js/**/**.js")
  .pipe(uglify())
  .pipe(gulp.dest("build/js"))
}

exports.js = js;

// Copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
}

exports.copy = copy;

// Clean

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Build

const build = gulp.series(
  clean,
  copy,
  html,
  styles,
  minStyles,
  js,
  images,
  webpTask,
  sprite
);

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

exports.reload = sync.reload;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles", "minStyles"));
  gulp.watch("source/*.html").on("change", gulp.series("html", "reload"));
  gulp.watch("source/js/**/*.js").on("change", gulp.series("js", "reload"));
  gulp.watch("source/img/**/*.{png,jpg,svg}", gulp.series("images", "webp", "sprite", "reload"));
}

exports.default = gulp.series(
  build, server, watcher
);