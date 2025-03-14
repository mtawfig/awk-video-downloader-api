"use strict";
//import express, { Request, Response } from "express";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const metadata_1 = require("../helpers/metadata");
const download_1 = require("../helpers/download");
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
    if (!url)
        return { source: "Unknown", message: "Invalid URL" };
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
app.post("/detect", (url, res) => __awaiter(void 0, void 0, void 0, function* () {
    //const { url } = req;
    if (!url)
        return res.status(400).json({ error: "URL is required" });
    const source = detectVideoSource(url);
    let metadata = { message: "Metadata not available" };
    if (source === "youtube") {
        metadata = yield (0, metadata_1.getYouTubeMetadata)(url);
    }
    else if (source === "facebook") {
        metadata = yield (0, metadata_1.getFacebookMetadata)(url);
    }
    else if (source === "twitter") {
        metadata = yield (0, metadata_1.getTwitterMetadata)(url);
    }
    else if (source === "tiktok") {
        metadata = yield (0, metadata_1.getTikTokMetadata)(url);
    }
    else if (source === "instagram") {
        metadata = yield (0, metadata_1.getInstagramMetadata)(url);
    }
    res.json({ url, source, metadata });
}));
/**
 * API Endpoint: Detects video source and downloads it.
 */
app.post("/download", (url, res) => __awaiter(void 0, void 0, void 0, function* () {
    //const { url } = req;
    if (!url)
        return res.status(400).json({ error: "URL is required" });
    const source = detectVideoSource(url);
    if (source === "youtube")
        return (0, download_1.downloadYouTubeVideo)(url, res);
    if (source === "facebook")
        return (0, download_1.downloadFacebookVideo)(url, res);
    if (source === "twitter")
        return (0, download_1.downloadTwitterVideo)(url, res);
    if (source === "tiktok")
        return (0, download_1.downloadTikTokVideo)(url, res);
    if (source === "instagram")
        return (0, download_1.downloadInstagramVideo)(url, res);
    return res.status(400).json({ error: "Unsupported video source" });
}));
/**
 * Export the server as a Netlify function.
 */
module.exports.handler = serverless(app);
