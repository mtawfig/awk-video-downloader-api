//import express, { Request, Response } from "express";

type MetadataResponse = { 
  message?: string;
  error?: string;
  title?: string;
  duration?: number | string;
  thumbnail?: string;
  views?: number | string;
  author?: string;
  uploader?: string;
};

const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

import { getYouTubeMetadata, getFacebookMetadata, getTwitterMetadata, getTikTokMetadata, getInstagramMetadata } from "../helpers/metadata";
import { downloadYouTubeVideo, downloadFacebookVideo, downloadTwitterVideo, downloadTikTokVideo, downloadInstagramVideo } from "../helpers/download";

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
function detectVideoSource(url: string) {
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
app.post("/detect", async (url: string, res: any) => {
    //const { url } = req;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const source = detectVideoSource(url);
    let metadata: MetadataResponse = { message: "Metadata not available" };

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
app.post("/download", async (url: string, res: any) => {
    //const { url } = req;
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
