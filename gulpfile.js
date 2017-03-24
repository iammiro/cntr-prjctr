const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const stylus = require('gulp-stylus');
const coffee = require('gulp-coffee');
const imagemin = require('gulp-imagemin');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const nested = require('postcss-nested');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const concatCss = require('gulp-concat-css');
const Filter = require('gulp-filter');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pump = require('pump');

// Static server
gulp.task('serve', ['stylus', 'pug', 'min-js', 'min-css', 'min-scripts', 'compress-images'], function () {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });

    gulp.watch('src/**/*.styl', ['stylus']);
    gulp.watch('src/**/*.pug', ['pug']);
    gulp.watch('src/**/*.coffee', ['coffee']);
    gulp.watch('build/*.*').on('change', browserSync.reload);
});

//compress images
gulp.task('compress-images', function () {
    gulp.src('src/assets/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/img'))
});

//compress js
gulp.task('min-js', function (cb) {
    pump([
            gulp.src('src/block/**/*.js')
            .pipe(concat('main.js'))
                .pipe(babel({
                    presets: ['es2015']
                })),
            uglify(),
            gulp.dest('build/js/')
        ],
        cb
    );
});

//concat and compress js lib
gulp.task('min-scripts', function (cb) {
    pump([
            gulp.src('src/assets/vendor/*.js')
                .pipe(concat('bundle.js')),
            uglify(),
            gulp.dest('build/js/')
        ],
        cb
    );
});

//concat vendor CSS
gulp.task('min-css', function () {
    return gulp.src('src/assets/vendor/*.css')
        .pipe(concatCss("bundle.css"))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('build/css/'));
});

// compile + autoprefixer + compress .styl
gulp.task('stylus', function () {
    const f = Filter(['src/block/**/*.styl'], {restore: true});
    return gulp.src('src/block/**/*.styl')
        .pipe(f)
        .pipe(stylus())
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
});

// compile .pug
gulp.task('pug', function () {
    return gulp.src('src/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.stream());
});

// compile .coffee
gulp.task('coffee', function () {
    return gulp.src('src/**/*.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('build/js/'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);