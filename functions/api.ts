const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra"); 
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const cheerio = require("cheerio");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const {
    getYouTubeMetadata,
    getFacebookMetadata,
    getTwitterMetadata,
    getTikTokMetadata,
    getInstagramMetadata
} = require("../helpers/metadata");
const {
    downloadYouTubeVideo,
    downloadFacebookVideo,
    downloadTwitterVideo,
    downloadTikTokVideo,
    downloadInstagramVideo
} = require("../helpers/download");

puppeteerExtra.use(StealthPlugin());

const execPromise = util.promisify(exec);
const app = express();

// Apply CORS middleware
app.use(cors({
    origin: "*",
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Content-Type, Authorization, Content-Disposition",
    exposedHeaders: "Content-Disposition",
    credentials: true,
}));

app.use(express.json());

/**
 * Detects video source based on URL.
 */
function detectVideoSource(url) {
    if (!url) return { source: "Unknown", message: "Invalid URL" };

    const patterns = {
        youtube: /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)/,
        facebook: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch)/,
        twitter: /(?:https?:\/\/)?(?:www\.)?(twitter\.com|x\.com)/,
        tiktok: /(?:https?:\/\/)?(?:www\.)?(tiktok\.com)/,
        instagram: /(?:https?:\/\/)?(?:www\.)?(instagram\.com)/,
    };

    for (const [source, pattern] of Object.entries(patterns)) {
        if (pattern.test(url)) {
            return source;
        }
    }

    return "Unknown";
}

/**
 * API Endpoint: Detects video source and fetches metadata.
 */
app.post("/detect", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const source = detectVideoSource(url);
    let metadata = { message: "Metadata not available" };

    if (source === "youtube") {
        metadata = await getYouTubeMetadata(url);
    } else if (source === "facebook") {
        metadata = await getFacebookMetadata(url);
    } else if (source === "twitter") {
        metadata = await getTwitterMetadata(url);
    } else if (source === "tiktok") {
        metadata = await getTikTokMetadata(url);
    } else if (source === "instagram") {
        metadata = await getInstagramMetadata(url);
    }

    res.json({ url, source, metadata });
});

/**
 * API Endpoint: Detects video source and downloads it.
 */
app.post("/download", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const source = detectVideoSource(url);

    if (source === "youtube") return downloadYouTubeVideo(url, res);
    if (source === "facebook") return downloadFacebookVideo(url, res);
    if (source === "twitter") return downloadTwitterVideo(url, res);
    if (source === "tiktok") return downloadTikTokVideo(url, res);
    if (source === "instagram") return downloadInstagramVideo(url, res);

    return res.status(400).json({ error: "Unsupported video source" });
});

/**
 * Export the server as a Netlify function.
 */
module.exports.handler = serverless(app);
