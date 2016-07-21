(function () {
  'use strict';

var basePaths = {
	src: 'src/',
	dest: 'dest/',
  lib: 'libraries/'
};

var paths = {
  root: './',
  css: {
    src: basePaths.src + 'sass',
    dest: basePaths.dest + 'css'
  },
  js: {
    src: basePaths.src + 'js',
    dest: basePaths.dest + 'js'
  },
	sprite: {
		src: basePaths.src + 'img',
		dest: basePaths.dest + 'img',
		css: basePaths.src + 'sass/partials/utilities/variables',
    tpl: basePaths.src + 'tpl'
	},
  fonts: 'fonts'
};

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    importOnce = require('node-sass-import-once'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    livereload = require('gulp-livereload'),
    svgSprite = require('gulp-svg-sprite'),
    imagemin = require('gulp-imagemin'),
    svg2png = require('gulp-svg2png'),
    del = require('del'),
    install = require('gulp-install'),
    neat = require('node-neat').includePaths;

//////////////////////////////
// Install dependencies
//////////////////////////////

gulp.task('install-dev', function() {
  return gulp.src(['./bower.json'])
    .pipe(install());
});

gulp.task('install-prod', ['clean-lib'], function() {
  return gulp.src(['./bower.json'])
    .pipe(install({production: true}));
});

//////////////////////////////
// Clean dest directory
//////////////////////////////
gulp.task('clean-dest', function () {
  del([basePaths.dest + '**']);
});

gulp.task('clean-lib', ['javascript-dist', 'sass-dist'], function () {
  del([basePaths.lib + '**']);
});

//////////////////////////////
// JavaScript
//////////////////////////////

// Concatenate with sourcemap and reload
gulp.task('javascript', function() {
  return gulp.src([paths.js.src + '/globals/**/*.js', paths.js.src + '/components/**/*.js', paths.js.src + '/layouts/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(sourcemaps.init())
      .pipe(concat('theme.behaviors.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(livereload());
});

// Concatenate and minify for deployment
gulp.task('javascript-dist', ['install-dev', 'clean-dest'], function() {
  return gulp.src([paths.js.src + '/globals/**/*.js', paths.js.src + '/components/**/*.js', paths.js.src + '/layouts/**/*.js'])
    .pipe(concat('theme.behaviors.min.js'))
    .pipe(uglify({mangle: true}).on('error', function(e) { console.log('\x07',e.message); return this.end(); }))
    .pipe(gulp.dest(paths.js.dest));
});

//////////////////////////////
// Sass
//////////////////////////////

// Process with nested style and sourcemap and reload
gulp.task('sass', function () {
  return gulp.src([paths.css.src + '/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['sass'].concat(neat),
      outFile: paths.css.dest,
      sourceMap: true,
      outputStyle: 'nested',
      importer: importOnce,
      importOnce: {
        index: false,
        css: false,
        bower: true
      }
    })
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(livereload());
});

// Process with compressed style for distribution
gulp.task('sass-dist', ['install-dev', 'clean-dest', 'sprite'], function () {
  return gulp.src([paths.css.src + '/*.scss', paths.css.src + '/fallback/*.scss'])
    .pipe(sass({
      includePaths: ['styles'].concat(neat),
      outFile: paths.css.dest,
      sourceMap: false,
      outputStyle: 'compressed',
      importer: importOnce,
      importOnce: {
        index: false,
        css: false,
        bower: true
      }
    })
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.css.dest));
});

//////////////////////////////
// SVG Sprite with PNG fallback
//////////////////////////////

gulp.task('svgSprite', function() {
  return gulp.src(paths.sprite.src + '/*.svg')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(svgSprite({
      'mode': {
        'css': {
          'spacing': {
            'padding': 5
          },
          'dest': './',
          'layout': 'diagonal',
          'sprite': paths.sprite.dest + '/sprite.svg',
          'bust': false,
          'render': {
            'scss': {
              'dest': paths.sprite.css + '/_sprite.scss',
              'template': paths.sprite.tpl + '/sprite-template.scss'
            }
          }
        }
      }
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('pngSprite', ['svgSprite'], function() {
  return gulp.src(paths.sprite.dest + '/sprite.svg')
    .pipe(svg2png())
    .pipe(gulp.dest(paths.sprite.dest));
});

//////////////////////////////
// Watch
//////////////////////////////

gulp.task('watch', ['install-dev'], function () {
  livereload.listen();
  gulp.watch(paths.sprite.src + '/*.svg', ['sprite']);
  gulp.watch(paths.js.src + '/**/*.js', ['javascript']);
  gulp.watch(paths.css.src + '/**/*.scss', ['sass']);
  gulp.watch('templates/**/*.php', ['sass']);
});

//////////////////////////////
// Build Tasks
//////////////////////////////

gulp.task('sprite', ['pngSprite']);
gulp.task('default', ['watch']);
gulp.task('build', ['install-prod']);

}());
