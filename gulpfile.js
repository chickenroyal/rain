var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var fileinclude = require('gulp-file-include');

/* JS */
gulp.task('scripts', function () {
  return gulp.src('app/js/**/*.js')             // find all .js files
    .pipe(concat('rain.min.js'))                // combine them into one file, named rain.min.js
    .pipe(uglify())                             // minify scripts
    .pipe(gulp.dest('dist/js'))                 // save into dist/js/ folder
    .pipe(browserSync.stream());                // inject into Browsersync
});

/* CSS */
gulp.task('styles', function () {
  return gulp.src('app/sass/main.scss')         // use main.scss file, @import partials in Sass rather than compile/concat in Gulp
    .pipe(sass({ outputStyle: 'expanded' }))    // compile Sass
    .pipe(autoprefixer({ flexbox: 'no-2009' })) // add prefixes where needed. skipping IEs early flexbox implementation
    .pipe(cleanCSS())                           // minify compiled, prefixed css
    .pipe(rename('styles.min.css'))             // rename output
    .pipe(gulp.dest('dist/css'))                // save into dist/css/ folder
    .pipe(browserSync.stream());                // inject into Browsersync
});

/* Images */
gulp.task('images', function () {
  return gulp.src('app/images/**/*')            // specify where the images are
    .pipe(cache(imagemin()))                    // optimise them
    .pipe(gulp.dest('dist/images'));            // save into dist/images folder
});

gulp.task('html', function() {
  gulp.src(['app/*.html'])                      // select html files
    .pipe(fileinclude({                         // import SVG defs into top of page
      prefix: '@@',
      basepath: '',
      indent: true
    }))
    .pipe(gulp.dest('dist'));                   // copy from app/ folder to dist/ folder
});

gulp.task('move', function() {
  gulp.src(['app/*.*', '!app/*.html'])          // select everything in root of app/, except html files
    .pipe(gulp.dest('dist'));                   // copy it to dist/
});

/* Tasks to use in command prompt */
gulp.task('watch', function () {
  browserSync.init({  // launch a Browsersync local server
    browser: 'chrome',
    notify: false,
    server: {
      baseDir: 'dist/'
    }
  });

  gulp.watch('app/sass/*.scss', ['styles']);  // watch Sass files, on change run 'styles' task
  gulp.watch('app/js/**/*.js', ['scripts']);  // watch JS files, on change run 'scripts' task
  gulp.watch('app/images/**/*', ['images']);  // watch image files, on change run 'images' task
  gulp.watch('app/*.*', ['html', 'move']);    // watch HTML changes, on change run 'html' task
  gulp.watch('dist/*.*').on('change', browserSync.reload);  // watch for changes to .html files, reload browserSync
});

gulp.task('default', ['styles', 'scripts', 'images', 'html', 'move', 'watch']); // compile Sass, minify JS, optimise images, copy HTML files, then watch for changes

gulp.task('clearCache', function (cb) {
  return cache.clearAll(cb);  // clear gulp cache - will mean all images get optimised again
});

gulp.task('clean', ['clearCache'], function(cb) {
  del(['dist'], cb);  // empty gulp cache then delete contents of dist to ensure no unused files are left
  gulp.start('styles', 'scripts', 'images', 'html', 'move');  // rebuild/compile all files
});
