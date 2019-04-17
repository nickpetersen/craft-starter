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
  return src('sass/**/*.scss')
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
    .pipe(dest('web/stylesheets/'))
    .pipe(browserSync.stream());
}

function images() {
  return src('images/*')
    .pipe(imagemin())
    .pipe(dest('web/assets/images/'));
}

function vendor() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/popper.js/dist/umd/popper.js',
    'node_modules/bootstrap/dist/js/bootstrap.js'
  ])
    .pipe(concat('vendors.js'))
    .pipe(terser())
    .pipe(dest('web/js'));
}

function js() {
  return src('js/*.js')
    .pipe(babel())
    .pipe(terser())
    .pipe(dest('web/js'));
}

exports.serve = series(css, images, vendor, js, () => {
  browserSync.init({
    proxy: 'https://craft-starter.test',
    notify: false
  });
  watch('sass/**/**/*.scss', css);
  watch('templates/**/**/**/*.twig').on('change', reload);
  watch('js/*.js', js).on('change', reload);
});

exports.default = series(css, images, vendor, js);
