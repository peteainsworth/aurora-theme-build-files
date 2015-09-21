(function () {
  'use strict';

var basePaths = {
	src: 'src/',
	dest: 'dest/',
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
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tagVersion = require('gulp-tag-version'),
    addsrc = require('gulp-add-src'),
    livereload = require('gulp-livereload'),
    svgSprite = require('gulp-svg-sprite'),
    svgo = require('gulp-svgo'),
    svg2png = require('gulp-svg2png'),
    del = require('del'),
    neat = require('node-neat').includePaths;

//////////////////////////////
// Concatenate, minify and uglify JS with sourcemap
//////////////////////////////
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

gulp.task('javascript-dist', function() {
  return gulp.src([paths.js.src + '/globals/**/*.js', paths.js.src + '/components/**/*.js', paths.js.src + '/layouts/**/*.js'])
    .pipe(concat('theme.behaviors.min.js'))
    .pipe(uglify({mangle: true}).on('error', function(e) { console.log('\x07',e.message); return this.end(); }))
    .pipe(gulp.dest(paths.js.dest));
});

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

gulp.task('sass-dist', ['sprite'], function () {
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
    .pipe(gulp.dest(paths.css.dest));
});

gulp.task('svgSprite', function() {
  return gulp.src(paths.sprite.src + '/*.svg')
    .pipe(svgo())
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
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(paths.sprite.src + '/*.svg', ['sprite']);
  gulp.watch(paths.js.src + '/**/*.js', ['javascript']);
  gulp.watch(paths.css.src + '/**/*.scss', ['sass']);
  gulp.watch('templates/**/*.php', ['sass']);
});

//////////////////////////////
// Clean dest dir
//////////////////////////////
gulp.task('clean', function () {
  return del([
    'dest/*'
  ]);
});

//////////////////////////////
// Commit changes and push
//////////////////////////////
function inc(importance) {
  return gulp.src(['./package.json'])
    .pipe(bump({type: importance}))
    .pipe(gulp.dest('./'))
    .pipe(addsrc([paths.css.dest + '/*', paths.js.dest + '/*']))
    .pipe(git.add({args: '-f'}))
    .pipe(git.commit('Compile and increment version for deployment'))
    .pipe(filter('package.json'))
    .pipe(tagVersion({prefix: '7.x-'}));
}

//////////////////////////////
// Build Tasks
//////////////////////////////
gulp.task('sprite', ['pngSprite']);
gulp.task('default', ['build', 'watch']);
gulp.task('build', ['clean', 'sass-dist', 'javascript-dist']);
gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major'); });

}());
