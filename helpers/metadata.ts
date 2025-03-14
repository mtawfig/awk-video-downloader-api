const axios = require("axios");
const yts = require("yt-search");
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteerExtra.use(StealthPlugin());

/**
 * Fetch metadata for a YouTube video.
 */
async function getYouTubeMetadata(url: string) {
    try {
        const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        if (!videoIdMatch) return { error: "Invalid YouTube URL" };

        const videoId = videoIdMatch[1];
        const results = await yts({ videoId });

        if (!results || !results.title) return { error: "Video not found" };

        return {
            title: results.title,
            duration: results.seconds,
            thumbnail: results.thumbnail,
            views: results.views,
        };
    } catch (error) {
        console.error("Error fetching YouTube metadata:", error);
        return { error: "Failed to fetch YouTube metadata" };
    }
}

/**
 * Fetch metadata for a Facebook video.
 */
async function getFacebookMetadata(url: string) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const metadata = await page.evaluate(() => ({
            title: document.title || "Facebook Video",
            duration: "Unknown",
            thumbnail: document.querySelector('meta[property="og:image"]')?.content || "",
            views: "Unknown",
        }));

        await browser.close();
        return metadata;
    } catch (error) {
        console.error("Error scraping Facebook metadata:", error);
        return { error: "Failed to fetch Facebook metadata" };
    }
}

/**
 * Fetch metadata for a Twitter (X) video.
 */
async function getTwitterMetadata(url: string) {
    try {
        const res = await axios.get(`https://publish.twitter.com/oembed?url=${url}`);
        return {
            title: res.data.title || res.data.author_name,
            author: res.data.author_name,
            thumbnail: res.data.thumbnail_url,
        };
    } catch (error) {
        console.error("Error fetching Twitter metadata:", error);
        return { error: "Failed to fetch Twitter metadata" };
    }
}

/**
 * Fetch metadata for a TikTok video.
 */
async function getTikTokMetadata(url: string) {
    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.data) {
            return {
                title: response.data.data.title || "TikTok Video",
                duration: response.data.data.duration,
                thumbnail: response.data.data.cover,
                views: response.data.data.play_count,
            };
        } else {
            return { error: "Invalid response from TikTok API" };
        }
    } catch (error) {
        console.error("Error fetching TikTok metadata:", error);
        return { error: "Failed to fetch TikTok metadata" };
    }
}

/**
 * Fetch metadata for an Instagram video.
 */
async function getInstagramMetadata(url: string) {
    try {
        if (!url.includes("instagram.com")) {
            return { error: "Invalid Instagram URL" };
        }

        const command = `yt-dlp --dump-json "${url}"`;
        const { exec } = require("child_process");
        const util = require("util");
        const execPromise = util.promisify(exec);

        const { stdout } = await execPromise(command);
        const metadata = JSON.parse(stdout);

        return {
            title: metadata.title || "Instagram Video",
            duration: metadata.duration || "Unknown",
            thumbnail: metadata.thumbnail || "",
            uploader: metadata.uploader || "Unknown",
            views: metadata.view_count || "Unknown",
        };
    } catch (error) {
        console.error("Error fetching Instagram metadata:", error);
        return { error: "Failed to fetch Instagram metadata" };
    }
}

module.exports = {
    getYouTubeMetadata,
    getFacebookMetadata,
    getTwitterMetadata,
    getTikTokMetadata,
    getInstagramMetadata,
};
