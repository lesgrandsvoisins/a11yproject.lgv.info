// const pluginRss = require("@11ty/eleventy-plugin-rss");
import pluginRss from "@11ty/eleventy-plugin-rss";
// const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
// const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
// const eleventyPluginTOC = require("eleventy-plugin-nesting-toc");

// const slugify = require("slugify");
import slugify from "slugify";
// const htmlmin = require("html-minifier");
import htmlmin from "html-minifier";
import getTagList from "./src/_11ty/getTagList.mjs";

// let markdownIt = require("markdown-it");
import markdownIt from "markdown-it";
// let markdownItAnchor = require("markdown-it-anchor");
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
// let markdownItFootnote = require("markdown-it-footnote");

import {
    eleventyImageTransformPlugin
} from "@11ty/eleventy-img";

import Image from "@11ty/eleventy-img";

export default (eleventyConfig) => {
    eleventyConfig.addPlugin(eleventyImageTransformPlugin);

    eleventyConfig.addPassthroughCopy({
        'src/js': 'js'
    });
    eleventyConfig.addPassthroughCopy({
        'src/img': 'img'
    });

    eleventyConfig.addShortcode("image", async function(src, alt, widths = [300, 600], sizes = "") {
        return Image(src, {
            widths,
            formats: ["avif", "jpeg"],
            returnType: "html", // new in v6.0
            htmlOptions: { // new in v6.0
                imgAttributes: {
                    alt, // required, though "" works fine
                    sizes, // required with more than one width, optional if single width output
                    loading: "lazy", // optional
                    decoding: "async", // optional
                }
            }
        });
    });

    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    // eleventyConfig.addPlugin(eleventyPluginTOC, {
    // 	wrapper: "div",
    // 	tags: ["h2", "h3"],
    // 	wrapperClass: "l-toc",
    // });

    eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return dateObj.toISOString();
    });

    /**
     * Returns a human-readable date
    	E.g. May 31, 2019
     */

    eleventyConfig.addFilter("dateReadable", (value) => {
        const date = new Date(value);
        const utcDate = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        );
        const formatOpts = {
            timezone: "UTC",
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        return new Intl.DateTimeFormat("en-US", formatOpts).format(utcDate);
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if (n < 0) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

    eleventyConfig.addFilter("getPostsByAuthor", (posts, author) => {
        return posts.filter((a) => {
            return a.data.author === author;
        });
    });

    // only content in the `posts/` directory
    eleventyConfig.addCollection("posts", function(collection) {
        return collection
            .getFilteredByGlob("./src/posts/*.md")
            .sort(function(a, b) {
                return a.date - b.date;
            });
    });

    eleventyConfig.addCollection("postCollections", function(collection) {
        // Grab our collections
        const rawPostCollections = collection
            .getFilteredByGlob("./src/collections/*")
            .sort(function(a, b) {
                return a.data.title.localeCompare(b.data.title);
            });

        // Build up the content in the collection
        const postCollections = {};

        collection.getFilteredByGlob("./src/posts/*").forEach(function(item) {
            if (item.data.collection) {
                if (!postCollections[item.data.collection.slug]) {
                    postCollections[item.data.collection.slug] = {
                        posts: [],
                    };
                }
                postCollections[item.data.collection.slug].posts.push(item);
            }
        });

        // Sort by the order
        for (const [slug, postCollection] of Object.entries(postCollections)) {
            postCollection.posts.sort(function(a, b) {
                return a.data.collection.order - b.data.collection.order;
            });

            // Attach collection object
            postCollections[slug].collection = rawPostCollections.find(
                (coll) => coll.template.parsed.name === slug
            );
        }

        /* Return post collections in the following data format
        [slug]: {
        	collection: Collection Object
        	posts: Array of Post Objects
        }
        */
        return postCollections;
    });

    // Universal slug filter strips unsafe chars from URLs
    eleventyConfig.addFilter("slugify", function(str) {
        return slugify(str.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""), {
            lower: true,
            replacement: "-",
            remove: /[*+~.·,()'"`´%!?¿:@»]/g,
        });
    });

    // Directories
    eleventyConfig.addPassthroughCopy("./src/fonts");

    // Social Media
    eleventyConfig.addPassthroughCopy("./src/apple-touch-icon.png");
    eleventyConfig.addPassthroughCopy("./src/favicon.svg");
    eleventyConfig.addPassthroughCopy("./src/logo.svg");
    eleventyConfig.addPassthroughCopy("./src/logo-100x100.png");
    eleventyConfig.addPassthroughCopy("./src/logo-192x192.png");
    eleventyConfig.addPassthroughCopy("./src/logo-192x192.png");
    eleventyConfig.addPassthroughCopy("./src/logo-512x512.png");
    eleventyConfig.addPassthroughCopy("./src/safari-pinned-tab.svg");
    eleventyConfig.addPassthroughCopy("./src/favicon.ico");

    // Config
    eleventyConfig.addPassthroughCopy("./src/humans.txt");
    eleventyConfig.addPassthroughCopy("./src/manifest.json");
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    eleventyConfig.addPassthroughCopy("./src/sw.js");

    eleventyConfig.addCollection("tagList", getTagList);

    /* Markdown Plugins */
    let options = {
        html: true,
        breaks: true,
        linkify: true,
    };
    let markdownLib = markdownIt(options)
        .use(markdownItFootnote)
        .use(markdownItAnchor);

    eleventyConfig.setLibrary("md", markdownLib);

    eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
        if (outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                removeComments: true,
                collapseWhitespace: true,
            });
            return minified;
        }

        return content;
    });

    return {
        templateFormats: ["md", "njk", "html", "liquid"],

        // If your site lives in a different subdirectory, change this.
        // Leading or trailing slashes are all normalized away, so don’t worry about it.
        // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
        // This is only used for URLs (it does not affect your file structure)
        pathPrefix: "/",

        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "njk",
        // dataTemplateEngine: "njk",
        passthroughFileCopy: true,
        dir: {
            input: "./src",
            includes: "_includes",
            data: "_data",
            output: "dist",
        },
    };
};