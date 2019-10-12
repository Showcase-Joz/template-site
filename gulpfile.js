/* 
Standard gulpfile for a static project

-- ************************************************ TODO'S WHEN UPDATED

-- Create src folder check
-- -- mkdir img,
-- -- touch sw.js for PWA basics
-- -- link to https://realfavicongenerator.net/ API to automate creation of assets
-- expand on html compress, https://github.com/kangax/html-minifier
*/



const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const newer = require('gulp-newer');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browsersync = require("browser-sync").create();



/* BROWSER-SYNC
************************
************************/

// Set BROWSER-SYNC
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist',
      // directory: true
    },
    port: 3000
  });
  done();
}


// ************************************************


/* TASKS TO INITIATE
************************
************************/


// ************************************************>>> GULP INIT
/* Initialises browser-sync with:
-- root file structure
-- optimised images
-- optimised css
-- optimised js

*/
gulp.task(
  'init',
  gulp.series(clean, gulp.parallel(copy, images, css, scripts), gulp.parallel(watchFiles, browserSync))
);


// ************************************************>>> GULP WATCH
/* Uses the watchFiles function to reload the browser window(s) on update

*/
gulp.task('watch', gulp.parallel(watchFiles, browserSync));


// ************************************************>>> GULP CLEAN
/* Removes the ./dist folder
-- root file structure
-- optimised images
-- optimised css
-- optimised js

*/
function clean() {
  return del(['./dist/']);
}


// ************************************************>>> GULP BUILD
/* Runs gulp tasks to produce a build environment
-- removes ./dist
-- creates ./dist
-- root file structure
-- collapse whitespace in .html files
-- optimised images
-- optimised css
-- optimised js

*/
gulp.task(
  'build',
  gulp.series(clean, gulp.parallel(copy, images, css, scripts), html)
);


// watch
gulp.task('watch', gulp.parallel(watchFiles, browserSync));

// ************************************************


/* CALL TASKS
************************
************************/


// Tasks
gulp.task('copy', copy);
gulp.task('images', images);
gulp.task('css', css);
gulp.task('html', html);
gulp.task('scripts', scripts);
gulp.task('clean', clean);


/* TASK FUNCTIONS 
************************
************************/


// ROOT FILES
// Copy all *.* files
function copy() {
  return gulp
    .src([
      './src/*.webmanifest',
      './src/*.xml',
      './src/*.txt',
      './src/*.html',
      './src/sw.js',
    ])
    .pipe(gulp.dest('./dist/'));
}

// ************************************************


// Optimise HTML
// Collapse all whitespace
function html() {
  return gulp
    .src([
      './src/*.html',
    ])
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('./dist'));
}

// ************************************************


// Optimize IMAGES
// -- watches image folder src/img
// -- treats each image type with presets
function images() {
  return gulp
    .src('./src/img/**/*')
    .pipe(newer('./dist/img'))
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(size({
      title: 'Image sizes after task...',
      pretty: true,
      showTotal: true,
    }))
    .pipe(gulp.dest('./dist/img'));
}

// ************************************************


// Optimise SCSS
// -- watches all scss files under src/scss/
// -- prefixes, concatenates/compresses, minifies and sourcemaps
function css() {
  return gulp
    .src([
      './src/scss/**/*.scss'
  ])
    .pipe(sourcemaps.init())
    .pipe(sass({
      // includePaths: require('node-normalize-scss').with('other/path', 'another/path')
      // - or -
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
    }))
    .pipe(sass({
        outputStyle: 'compressed',
      })
      .on('error', sass.logError))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(sourcemaps.write(''))
    .pipe(size({
      title: 'CSS size after task...',
      pretty: true,
      showTotal: true,
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browsersync.stream());
}

// ************************************************


// Optimise JS
// -- watches all js files under src/js/
// -- transpiles, concatenates, minifies and sourcemaps
function scripts() {
  return (
    gulp
    .src([
      './src/js/*.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main.min.js'))
    .pipe(uglify().on('error', console.error))
    .pipe(sourcemaps.write(''))
    .pipe(size({
      title: 'Scripts size after task...',
      pretty: true,
      showTotal: true,
    }))
    .pipe(gulp.dest('./dist/js'))
  );
}

// ************************************************


// Watches WATCHFILES
// -- watches all files used to create a basic distribution
// -- transpiles, concatenates, minifies and sourcemaps
function watchFiles() {
  // watch all scss files and subdirectories, update when reqiured
  gulp.watch('./src/scss/**/*', css);
  // watch all js files and subdirectories, update when reqiured
  gulp.watch('./src/js/**/*', gulp.series(scripts, browserSyncReload));
  // watch all root files (NOT SUBDIRECTORIES), update when reqiured
  gulp.watch(
    [
      './src/*.html',
      './src/*.webmanifest',
      './src/*.xml',
      './src/*.txt',
    ],
    gulp.series(copy, browserSyncReload)
  );
  // watch all image files and subdirectories, update when reqiured
  gulp.watch('./src/img/**/*', images);
}

// ************************************************


// BrowserSync Reload
// -- reloads browser when change to underlying files is made
function browserSyncReload(done) {
  browsersync.reload();
  done();
}
