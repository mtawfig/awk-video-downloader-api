"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeMetadata = getYouTubeMetadata;
exports.getFacebookMetadata = getFacebookMetadata;
exports.getTwitterMetadata = getTwitterMetadata;
exports.getTikTokMetadata = getTikTokMetadata;
exports.getInstagramMetadata = getInstagramMetadata;
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
const axios = require("axios");
const yts = require("yt-search");
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());
/**
 * Fetch metadata for a YouTube video.
 */
function getYouTubeMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract video ID from the URL
            const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            if (!videoIdMatch)
                return { error: "Invalid YouTube URL" };
            const videoId = videoIdMatch[1];
            const results = yield yts({ videoId });
            if (!results || !results.title)
                return { error: "Video not found" };
            ////console.log(results);
            return {
                title: results.title,
                duration: results.seconds, // Duration in seconds
                thumbnail: results.thumbnail,
                views: results.views,
            };
        }
        catch (error) {
            console.error("Error fetching YouTube metadata:", error);
            return { error: "Failed to fetch YouTube metadata" };
        }
    });
}
/**
 * Fetch metadata for a Facebook video.
 */
function getFacebookMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer.launch({ headless: true });
            const page = yield browser.newPage();
            yield page.goto(url, { waitUntil: "domcontentloaded" });
            // Extract video metadata (modify as needed)
            const metadata = yield page.evaluate(() => {
                var _a;
                ////console.log(document);
                return {
                    title: document.title || "Facebook Video",
                    duration: "Unknown", // Requires deeper scraping
                    thumbnail: ((_a = document.querySelector('meta[property="og:image"]')) === null || _a === void 0 ? void 0 : _a.content) || "",
                    views: "Unknown", // Facebook hides views without login
                };
            });
            yield browser.close();
            return metadata;
        }
        catch (error) {
            console.error("Error scraping Facebook metadata:", error);
            return { error: "Failed to fetch Facebook metadata" };
        }
    });
}
/**
 * Fetch metadata for a Twitter (X) video.
 */
function getTwitterMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios.get(`https://publish.twitter.com/oembed?url=${url}`);
            //console.log(res);
            return {
                title: res.data.title || res.data.author_name,
                author: res.data.author_name,
                thumbnail: res.data.thumbnail_url,
            };
        }
        catch (error) {
            console.error("Error fetching Twitter metadata:", error);
            return { error: "Failed to fetch Twitter metadata" };
        }
    });
}
/**
 * Fetch metadata for a TikTok video.
 */
function getTikTokMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Using an unofficial TikTok metadata API
            const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
            const response = yield axios.get(apiUrl);
            ////console.log(response);
            if (response.data && response.data.data) {
                return {
                    title: response.data.data.title || "TikTok Video",
                    duration: response.data.data.duration,
                    thumbnail: response.data.data.cover,
                    views: response.data.data.play_count,
                };
            }
            else {
                return { error: "Invalid response from TikTok API" };
            }
        }
        catch (error) {
            console.error("Error fetching TikTok metadata:", error);
            return { error: "Failed to fetch TikTok metadata" };
        }
    });
}
/**
 * Fetch metadata for an Instagram video.
 */
function getInstagramMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!url.includes("instagram.com")) {
                return { error: "Invalid Instagram URL" };
            }
            // Construct yt-dlp command to fetch metadata
            const command = `yt-dlp --dump-json "${url}"`;
            const { stdout } = yield execPromise(command);
            const metadata = JSON.parse(stdout);
            return {
                title: metadata.title || "Instagram Video",
                duration: metadata.duration || "Unknown",
                thumbnail: metadata.thumbnail || "",
                uploader: metadata.uploader || "Unknown",
                views: metadata.view_count || "Unknown",
            };
        }
        catch (error) {
            console.error("Error fetching Instagram metadata:", error);
            return { error: "Failed to fetch Instagram metadata" };
        }
    });
}
