//https://github.com/pepelsbey/playground/tree/master/25

import babel from 'gulp-babel';
import concat from 'gulp-concat';
import csso from 'gulp-csso';
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import plumber from 'gulp-plumber';
import pngquant from 'imagemin-pngquant';
import prefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import rigger from 'gulp-rigger';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import ssi from 'gulp-ssi';
import sync from 'browser-sync';
import uglify from 'gulp-uglify';
import svgSprite from 'gulp-svg-sprite';
import svgmin from 'gulp-svgmin';

// Html

export const buildHtml = () => {
	return gulp.src([
		'src/**/*.html'
	])
		.pipe(plumber())
		.pipe(ssi({root: './src'}))
		.pipe(gulp.dest('dist'))
		.pipe(sync.stream());
};

// Scripts

// export const buildJs = (done) => {
// 	gulp.src([
// 		'node_modules/jquery/dist/jquery.min.js',
// 		'node_modules/jquery-form-styler/dist/jquery.formstyler.min.js',
// 		'src/js/vendor/*.js'
// 	])
// 		.pipe(plumber())
// 		.pipe(uglify())
// 		.pipe(concat('vendor.min.js'))
// 		.pipe(gulp.dest('dist/js'))
// 		.pipe(sync.stream());

// 	gulp.src('src/js/main.js')
// 		.pipe(plumber())
// 		.pipe(rigger())
// 		.pipe(babel({
// 			presets: ['@babel/preset-env']
// 		}))
// 		.pipe(sourcemaps.init())
// 		.pipe(uglify())
// 		.pipe(sourcemaps.write())
// 		.pipe(concat('main.min.js'))
// 		.pipe(gulp.dest('dist/js'))
// 		.pipe(sync.stream());

// 	done();
// };

// Styles

export const buildCss = (done) => {
	gulp.src([
		'node_modules/normalize.css/normalize.css',
		'node_modules/jquery-form-styler/dist/jquery.formstyler.css'
	])
		.pipe(prefixer())
		.pipe(csso())
		.pipe(concat('vendor.min.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(sync.stream());

	gulp.src('src/css/main.scss')
		.pipe(plumber())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(replace('(/images/', '(../images/'))
		.pipe(prefixer())
		.pipe(csso())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/css'))
		.pipe(sync.stream());

	done();
};

//Fonts

export const buildFont = () => {
	return gulp.src('src/fonts/**/*.*')
		.pipe(plumber())
		.pipe(gulp.dest('dist/fonts'))
		.pipe(sync.stream({
			once: true
		}));
};

//Images

export const buildImage = (done) => {
	gulp.src('src/images/*.*')
		.pipe(plumber())
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest('dist/images'))
		.pipe(sync.stream());

	gulp.src('src/images/icons/*.svg')
		.pipe(plumber())
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// .pipe(cheerio({
		//     run: function($) {
		//         $('[fill]').removeAttr('fill');
		//         $('[stroke]').removeAttr('stroke');
		//         $('[style]').removeAttr('style');
		//     },
		//     parserOptions: { xmlMode: true }
		// }))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
				mode: {
					stack: {
						sprite: "sprite.svg"
					}
				},
			}
		))
		.pipe(gulp.dest('dist/images'))
		.pipe(sync.stream());

	done();
};

// Paths

export const fixPath = () => {
	const buildVersion = Date.now();

	return gulp.src('dist/*.html')
		.pipe(plumber())
		.pipe(replace('="/', '="'))
		.pipe(replace('"\\/img', '"img'))
		.pipe(replace('.css">', '.css?=' + buildVersion + '">'))
		.pipe(gulp.dest('dist'));
};

// All

export const buildAll = gulp.series(
	gulp.parallel(
		buildHtml,
		buildCss,
		buildFont,
		buildImage
	),
	fixPath
);

// Server

export const server = () => {
	sync.init({
		ui: false,
		notify: false,
		server: {
			baseDir: 'dist'
		}
	});
};

// Watch

export const watch = () => {
	gulp.watch('src/**/*.html', gulp.series(buildHtml, fixPath));
	gulp.watch('src/css/**/*.scss', gulp.series(buildCss));
	gulp.watch('src/fonts/**/*', gulp.series(buildFont));
	gulp.watch('src/img/**/*', gulp.series(buildImage));
};

// Dev

// noinspection JSUnusedGlobalSymbols
export const dev = gulp.series(
	buildAll,
	gulp.parallel(
		watch,
		server,
	),
);

// Default

// noinspection JSUnusedGlobalSymbols
export default gulp.series(
	buildAll
);
