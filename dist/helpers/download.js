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
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadYouTubeVideo = downloadYouTubeVideo;
exports.downloadFacebookVideo = downloadFacebookVideo;
exports.downloadTwitterVideo = downloadTwitterVideo;
exports.downloadTikTokVideo = downloadTikTokVideo;
exports.downloadInstagramVideo = downloadInstagramVideo;
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const execPromise = util.promisify(exec);
/**
 * Download YouTube video.
 */
function downloadYouTubeVideo(url, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate the YouTube URL
            if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
                return res.status(400).json({ error: "Invalid YouTube URL" });
            }
            // Generate a unique filename
            const outputFilePath = path.join(__dirname, "downloads", `video-${Date.now()}.mp4`);
            // Ensure the downloads folder exists
            fs.ensureDirSync(path.join(__dirname, "downloads"));
            // Construct yt-dlp command
            const command = `yt-dlp -f best "${url}"`;
            ////console.log("Executing:", command);
            // Execute the yt-dlp command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("yt-dlp Error:", error);
                    return res.status(500).json({ error: "Failed to download YouTube video" });
                }
                //console.log("Download completed:", stdout, stderr);
                // Set response headers for file download
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Disposition");
                res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
                res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
                res.setHeader("Content-Type", "video/mp4");
                // Stream the file back to the client
                const fileStream = fs.createReadStream(outputFilePath);
                fileStream.pipe(res);
                // Delete the file after sending it
                fileStream.on("close", () => fs.removeSync(outputFilePath));
            });
        }
        catch (error) {
            console.error("YouTube Download Error:", error);
            res.status(500).json({ error: "Failed to process YouTube video download" });
        }
    });
}
/**
 * Download Facebook video.
 */
function downloadFacebookVideo(url, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!url.includes("facebook.com")) {
                return res.status(400).json({ error: "Invalid Facebook URL" });
            }
            // Generate a unique filename
            const outputFilePath = path.join(__dirname, "downloads", `facebook-video-${Date.now()}.mp4`);
            // Ensure the downloads folder exists
            fs.ensureDirSync(path.join(__dirname, "downloads"));
            // Construct yt-dlp command
            const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
            //console.log("Executing:", command);
            // Execute the yt-dlp command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("yt-dlp Error:", error);
                    return res.status(500).json({ error: "Failed to download Facebook video" });
                }
                //console.log("Download completed:", stdout, stderr);
                // Set headers for file download
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Disposition");
                res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
                res.setHeader("Content-Disposition", `attachment; filename="facebook-video.mp4"`);
                res.setHeader("Content-Type", "video/mp4");
                // Stream the file back to the client
                const fileStream = fs.createReadStream(outputFilePath);
                fileStream.pipe(res);
                // Delete the file after sending it
                fileStream.on("close", () => fs.removeSync(outputFilePath));
            });
        }
        catch (error) {
            console.error("Facebook Download Error:", error);
            res.status(500).json({ error: "Failed to process Facebook video download" });
        }
    });
}
/**
 * Download Twitter video.
 */
function downloadTwitterVideo(url, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!url.includes("twitter.com") && !url.includes("x.com")) {
                return res.status(400).json({ error: "Invalid Twitter URL" });
            }
            // Generate a unique filename
            const outputFilePath = path.join(__dirname, "downloads", `twitter-video-${Date.now()}.mp4`);
            // Ensure the downloads folder exists
            fs.ensureDirSync(path.join(__dirname, "downloads"));
            // Construct yt-dlp command
            const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
            //console.log("Executing:", command);
            // Execute the yt-dlp command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("yt-dlp Error:", error);
                    return res.status(500).json({ error: "Failed to download Twitter video" });
                }
                //console.log("Download completed:", stdout, stderr);
                // Set headers for file download
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Disposition");
                res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
                res.setHeader("Content-Disposition", `attachment; filename="twitter-video.mp4"`);
                res.setHeader("Content-Type", "video/mp4");
                // Stream the file back to the client
                const fileStream = fs.createReadStream(outputFilePath);
                fileStream.pipe(res);
                // Delete the file after sending it
                fileStream.on("close", () => fs.removeSync(outputFilePath));
            });
        }
        catch (error) {
            console.error("Error fetching Twitter video:", error);
            res.status(500).json({ error: "Failed to download Twitter video" });
        }
    });
}
/**
 * Download TikTok video.
 */
function downloadTikTokVideo(url, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!url.includes("tiktok.com")) {
                return res.status(400).json({ error: "Invalid TikTok URL" });
            }
            // Generate a unique filename
            const outputFilePath = path.join(__dirname, "downloads", `tiktok-video-${Date.now()}.mp4`);
            // Ensure the downloads folder exists
            fs.ensureDirSync(path.join(__dirname, "downloads"));
            // Construct yt-dlp command
            const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
            //console.log("Executing:", command);
            // Execute the yt-dlp command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("yt-dlp Error:", error);
                    return res.status(500).json({ error: "Failed to download TikTok video" });
                }
                //console.log("Download completed:", stdout, stderr);
                // Set headers for file download
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Disposition");
                res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
                res.setHeader("Content-Disposition", `attachment; filename="tiktok-video.mp4"`);
                res.setHeader("Content-Type", "video/mp4");
                // Stream the file back to the client
                const fileStream = fs.createReadStream(outputFilePath);
                fileStream.pipe(res);
                // Delete the file after sending it
                fileStream.on("close", () => fs.removeSync(outputFilePath));
            });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to download TikTok video" });
        }
    });
}
/**
 * Download Instagram Video
 */
function downloadInstagramVideo(url, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!url.includes("instagram.com/reel/")) {
                return res.status(400).json({ error: "Invalid Instagram Reels URL" });
            }
            // Generate a unique filename
            const outputFilePath = path.join(__dirname, "downloads", `instagram-reel-${Date.now()}.mp4`);
            // Ensure the downloads folder exists
            fs.ensureDirSync(path.join(__dirname, "downloads"));
            // Construct yt-dlp command
            const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
            // Execute the yt-dlp command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("yt-dlp Error:", error);
                    return res.status(500).json({ error: "Failed to download Instagram Reel" });
                }
                // Set headers for file download
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Disposition");
                res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
                res.setHeader("Content-Disposition", `attachment; filename="instagram-reel.mp4"`);
                res.setHeader("Content-Type", "video/mp4");
                // Stream the file back to the client
                const fileStream = fs.createReadStream(outputFilePath);
                fileStream.pipe(res);
                // Delete the file after sending it
                fileStream.on("close", () => fs.removeSync(outputFilePath));
            });
        }
        catch (error) {
            console.error("Instagram Reels Download Error:", error);
            res.status(500).json({ error: "Failed to process Instagram Reels download" });
        }
    });
}
