// This file is used to collect and process all the site's assets, to help
// generate the live website. You can read more about Gulp here:
// https://gulpjs.com/

// This setup is based on Chris Ferdinandi's excellent Gulp Boilerplate
// project: https://gomakethings.com/a-new-gulp-boilerplate/


// Settings ///////////////////////////////////////////////////////////////////
// Turn on/off build features
const settings = {
    clean: true,
    favicons: false,
    icons: true,
    images: true,
    lint: true,
    misc: true,
    polyfills: true,
    reload: true,
    scripts: true,
    styleguide: true,
    styles: true,
    svgs: true
};


// Paths to project folders ///////////////////////////////////////////////////
const paths = {
    input: 'src/',
    output: 'dist/',
    scripts: {
        input: 'src/js/**/*.js',
        polyfills: 'src/js/**/*.polyfill.js',
        output: 'dist/js/'
    },
    styles: {
        input: 'src/css/**/*.scss',
        output: 'dist/css/'
    },
    images: {
        input: 'src/img/**/*.{jpg,jpeg,gif,webm,webp,png}',
        output: 'dist/img/'
    },
    icons: {
        input: 'src/img/icons/*.svg',
        output: 'dist/'
    },
    svgs: {
        input: 'src/img/**/*.svg',
        output: 'dist/img/'
    },
    reload: './dist/'
};


// Gulp Packages //////////////////////////////////////////////////////////////

// General
import gulp from 'gulp';
const {
    src,
    dest,
    watch,
    series,
    parallel,
    lastRun
} = gulp;
// const kss = require('kss');
// const rename = require('gulp-rename');
import rename from 'gulp-rename';

// Scripts
// const jshint = require('gulp-jshint');
// const terser = require('gulp-terser');

// Styles
// const sass = require('gulp-sass')(require('sass'));
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
// const prefix = require('gulp-autoprefixer');
// const minify = require('gulp-cssnano');
// const gulpStylelint = require('gulp-stylelint');
// const purgeCSS = require('gulp-purgecss');
import purgeCSS from 'gulp-purgecss'

// SVGs
// const svgmin = require('gulp-svgmin');
// const svgSprite = require('gulp-svg-sprite');

// BrowserSync
// const browserSync = require('browser-sync').create();
import browserSync from 'browser-sync';


// Package Config /////////////////////////////////////////////////////////////
const configIcons = {
    mode: {
        symbol: {
            dest: 'img',
            sprite: 'icons.svg',
            example: false
        }
    },
    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
    }
};


// Tasks //////////////////////////////////////////////////////////////////////

// Lint, minify, and concatenate scripts
const buildScripts = function(done) {
    // Make sure this feature is activated before running
    if (!settings.scripts) return done();
    // Run tasks on script files
    const scriptSrc = [paths.scripts.input];
    if (!settings.polyfills) {
        scriptSrc.push('!' + paths.scripts.polyfills);
    }
    return src(scriptSrc, {
            since: lastRun(buildScripts)
        })
        .pipe(terser())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(paths.scripts.output));
};


// Lint scripts
const lintScripts = function(done) {
    // Make sure this feature is activated before running
    if (!settings.lint) return done();
    // Lint scripts
    return src(paths.scripts.input, {
        since: lastRun(lintScripts)
    });
    // .pipe(jshint())
    // .pipe(jshint.reporter('jshint-stylish'));
};

// Process, lint, and minify Sass files
const buildStyles = function(done) {
    // Make sure this feature is activated before running
    if (!settings.styles) return done();
    // Run tasks on all Sass files
    return (
        src(paths.styles.input)
        .pipe(
            sass.sync({
                outputStyle: "expanded",
                sourceComments: true,
            })
        )
        .pipe(
            purgeCSS({
                content: ["src/**/*.njk", "src/**/*.md"],
                safelist: {
                    standard: [
                        "a",
                        "atrule",
                        "attr-name",
                        "attr-value",
                        "bold",
                        "boolean",
                        "builtin",
                        "cdata",
                        "char",
                        "comment",
                        "constant",
                        "deleted",
                        "doctype",
                        "entity",
                        "function",
                        "important",
                        "inserted",
                        "italic",
                        "keyword",
                        "number",
                        "operator",
                        "prolog",
                        "property",
                        "punctuation",
                        "regex",
                        "selector",
                        "string",
                        "symbol",
                        "tag",
                        "token",
                        "url",
                        "variable",
                    ],
                    deep: [/^c-content/],
                    greedy: [/^c-form/, /h5/, /data-user-theme/, /data-colors-scheme/],
                },
            })
        )
        .pipe(
            prefix({
                cascade: true,
                remove: true,
            })
        )
        .pipe(dest(paths.styles.output))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(
            minify({
                discardComments: {
                    removeAll: true,
                },
            })
        )
        .pipe(dest(paths.styles.output))
        .pipe(browserSync.stream())
    );
};


// Lint styles
const lintStyles = function(done) {
    // Make sure this feature is activated before running
    if (!settings.lint) return done();
    // Lint scripts
    return src(paths.styles.input, {
        since: lastRun(lintStyles)
    });
    // .pipe(gulpStylelint({
    //     reporters: [{
    //         formatter: 'string',
    //         console: true
    //     }]
    // }));
};


// Process images
const processImages = function(done) {
    // Make sure this feature is activated before running
    if (!settings.images) return done();
    return src(paths.images.input, {
            since: lastRun(processImages)
        })
        .pipe(dest(paths.images.output));
};


// Process icons
const processIcons = function(done) {
    // Make sure this feature is activated before running
    if (!settings.icons) return done();
    return src(paths.icons.input)
        // .pipe(svgSprite(configIcons))
        .pipe(dest(paths.icons.output));
};


// Optimize SVG files
const buildSVGs = function(done) {
    // Make sure this feature is activated before running
    if (!settings.svgs) return done();
    // Optimize SVG files
    return src(paths.svgs.input, {
            since: lastRun(buildSVGs)
        })
        // .pipe(svgmin())
        .pipe(dest(paths.svgs.output));
};


// Build styleguide
const buildStyleguide = function(done) {
    // Make sure this feature is activated before running
    if (!settings.styleguide) return done();
    // Generate styleguide with these congig options
    return done();
    // return kss({
    //     css: '../css/screen.min.css',
    //     destination: 'dist/styleguide',
    //     placeholder: "[modifier]",
    //     source: 'src/css',
    //     title: "Styleguide - The A11Y Project"
    // });
};


// Watch for changes to the src directory
const startServer = function(done) {
    // Make sure this feature is activated before running
    if (!settings.reload) return done();
    // Initialize BrowserSync
    browserSync.init({
        server: {
            baseDir: paths.reload
        }
    });
    done();
};


// Reload the browser when files change
const reloadBrowser = function(done) {
    if (!settings.reload) return done();
    browserSync.reload();
    done();
};

const styles = parallel(lintStyles, buildStyles);
const scripts = parallel(lintScripts, buildScripts);

// Watch for changes
const watchSource = function() {
    watch(paths.styles.input, styles);
    watch(paths.scripts.input, series(scripts, reloadBrowser));
    watch(paths.images.input, series(processImages, reloadBrowser));
    watch(paths.icons.input, series(processIcons, reloadBrowser));
    watch(paths.svgs.input, series(buildSVGs, reloadBrowser));
    watch('./dist/**/*.html', reloadBrowser);
};


// Export Tasks ///////////////////////////////////////////////////////////////

// Default task: `gulp`


export default () => {
    return parallel(
        styles,
        scripts,
        processImages,
        processIcons,
        buildSVGs,
        buildStyleguide
    );
};
// exports.default = parallel(
//     styles,
//     scripts,
//     processImages,
//     processIcons,
//     buildSVGs,
//     buildStyleguide
// )

// Watch and reload: `gulp watch`
export const watchServer = () => {
    series(
        parallel(
            styles,
            scripts,
            processImages,
            processIcons,
            buildSVGs,
            buildStyleguide
        ),
        startServer,
        watchSource
    );
};
// };
// exports.watch =
