import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const axios = require("axios");
const yts = require("yt-search");
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteerExtra.use(StealthPlugin());

/**
 * Fetch metadata for a YouTube video.
 */
export async function getYouTubeMetadata(url: string) {
    try {
        // Extract video ID from the URL
        const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        if (!videoIdMatch) return { error: "Invalid YouTube URL" };

        const videoId = videoIdMatch[1];
        const results = await yts({ videoId });

        if (!results || !results.title) return { error: "Video not found" };

		////console.log(results);
        return {
            title: results.title,
            duration: results.seconds, // Duration in seconds
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
export async function getFacebookMetadata(url: string) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });

        // Extract video metadata (modify as needed)
        const metadata = await page.evaluate(() => {
			////console.log(document);
            return {
                title: document.title || "Facebook Video",
                duration: "Unknown", // Requires deeper scraping
                thumbnail: (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content || "",
                views: "Unknown", // Facebook hides views without login
            };
        });

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
export async function getTwitterMetadata(url: string) {
    try {
        const res = await axios.get(`https://publish.twitter.com/oembed?url=${url}`);
		//console.log(res);
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
export async function getTikTokMetadata(url: string) {
    try {
        // Using an unofficial TikTok metadata API
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;

        const response = await axios.get(apiUrl);
		////console.log(response);
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
export async function getInstagramMetadata(url: string) {
    try {
        if (!url.includes("instagram.com")) {
            return { error: "Invalid Instagram URL" };
        }

        // Construct yt-dlp command to fetch metadata
        const command = `yt-dlp --dump-json "${url}"`;
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

