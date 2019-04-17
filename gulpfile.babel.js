const { watch, dest, src, series } = require('gulp');
const browserSync = require('browser-sync').create();
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const reload = browserSync.reload;

function css() {
  return src('assets/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      scss({
        outputStyle: 'compressed',
        includePaths: './node_modules/'
      }).on('error', scss.logError)
    )
    .pipe(
      autoprefixer({
        browsers: 'last 2 versions'
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest('css/'))
    .pipe(browserSync.stream());
}

function images() {
  return src('assets/images/*')
    .pipe(imagemin())
    .pipe(dest('images/'));
}

function vendor() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/popper.js/dist/umd/popper.js',
    'node_modules/bootstrap/dist/js/bootstrap.js'
  ])
    .pipe(concat('vendors.js'))
    .pipe(terser())
    .pipe(dest('js/'));
}

function js() {
  return src('assets/js/*.js')
    .pipe(babel())
    .pipe(terser())
    .pipe(dest('js/'));
}

exports.serve = series(css, images, vendor, js, () => {
  browserSync.init({
    proxy: 'http://craft-starter.test',
    notify: false
  });
  watch('assets/sass/**/**/*.scss', css);
  watch('templates/**/**/**/*.twig').on('change', reload);
  watch('assets/js/*.js', js).on('change', reload);
});

exports.default = series(css, images, vendor, js);
