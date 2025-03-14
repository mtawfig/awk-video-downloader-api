import express, { Request, Response } from "express";

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const util = require("util");

const execPromise = util.promisify(exec);

/**
 * Download YouTube video.
 */
export async function downloadYouTubeVideo(url: string, res: Response) {
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
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
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
    } catch (error) {
        console.error("YouTube Download Error:", error);
        res.status(500).json({ error: "Failed to process YouTube video download" });
    }

}

/**
 * Download Facebook video.
 */
export async function downloadFacebookVideo(url: string, res: Response) {
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
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
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
    } catch (error) {
        console.error("Facebook Download Error:", error);
        res.status(500).json({ error: "Failed to process Facebook video download" });
    }
}

/**
 * Download Twitter video.
 */
export async function downloadTwitterVideo(url: string, res: Response) {
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
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
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
    } catch (error) {
        console.error("Error fetching Twitter video:", error);
        res.status(500).json({ error: "Failed to download Twitter video" });
    }
}

/**
 * Download TikTok video.
 */
export async function downloadTikTokVideo(url: string, res: Response) {
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
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
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
    } catch (error) {
        res.status(500).json({ error: "Failed to download TikTok video" });
    }
}

/**
 * Download Instagram Video
 */
export async function downloadInstagramVideo(url: string, res: Response) {
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
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
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
    } catch (error) {
        console.error("Instagram Reels Download Error:", error);
        res.status(500).json({ error: "Failed to process Instagram Reels download" });
    }
}
