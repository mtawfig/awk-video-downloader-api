const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const util = require("util");

const execPromise = util.promisify(exec);

/**
 * Download a YouTube video using yt-dlp.
 */
async function downloadYouTubeVideo(url: string, res: any) {
    try {
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }

        const outputFilePath = path.join(__dirname, "..", "downloads", `video-${Date.now()}.mp4`);
        fs.ensureDirSync(path.join(__dirname, "..", "downloads"));

        const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
        console.log("Executing:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("yt-dlp Error:", error);
                return res.status(500).json({ error: "Failed to download YouTube video" });
            }

            streamAndDeleteFile(outputFilePath, res);
        });
    } catch (error) {
        console.error("YouTube Download Error:", error);
        res.status(500).json({ error: "Failed to process YouTube video download" });
    }
}

/**
 * Download a Facebook video using yt-dlp.
 */
async function downloadFacebookVideo(url: string, res: any) {
    try {
        if (!url.includes("facebook.com")) {
            return res.status(400).json({ error: "Invalid Facebook URL" });
        }

        const outputFilePath = path.join(__dirname, "..", "downloads", `facebook-video-${Date.now()}.mp4`);
        fs.ensureDirSync(path.join(__dirname, "..", "downloads"));

        const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
        console.log("Executing:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("yt-dlp Error:", error);
                return res.status(500).json({ error: "Failed to download Facebook video" });
            }

            streamAndDeleteFile(outputFilePath, res);
        });
    } catch (error) {
        console.error("Facebook Download Error:", error);
        res.status(500).json({ error: "Failed to process Facebook video download" });
    }
}

/**
 * Download a Twitter video using yt-dlp.
 */
async function downloadTwitterVideo(url: string, res: any) {
    try {
        if (!url.includes("twitter.com") && !url.includes("x.com")) {
            return res.status(400).json({ error: "Invalid Twitter URL" });
        }

        const outputFilePath = path.join(__dirname, "..", "downloads", `twitter-video-${Date.now()}.mp4`);
        fs.ensureDirSync(path.join(__dirname, "..", "downloads"));

        const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
        console.log("Executing:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("yt-dlp Error:", error);
                return res.status(500).json({ error: "Failed to download Twitter video" });
            }

            streamAndDeleteFile(outputFilePath, res);
        });
    } catch (error) {
        console.error("Twitter Download Error:", error);
        res.status(500).json({ error: "Failed to process Twitter video download" });
    }
}

/**
 * Download a TikTok video using yt-dlp.
 */
async function downloadTikTokVideo(url: string, res: any) {
    try {
        if (!url.includes("tiktok.com")) {
            return res.status(400).json({ error: "Invalid TikTok URL" });
        }

        const outputFilePath = path.join(__dirname, "..", "downloads", `tiktok-video-${Date.now()}.mp4`);
        fs.ensureDirSync(path.join(__dirname, "..", "downloads"));

        const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
        console.log("Executing:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("yt-dlp Error:", error);
                return res.status(500).json({ error: "Failed to download TikTok video" });
            }

            streamAndDeleteFile(outputFilePath, res);
        });
    } catch (error) {
        console.error("TikTok Download Error:", error);
        res.status(500).json({ error: "Failed to process TikTok video download" });
    }
}

/**
 * Download an Instagram video using yt-dlp.
 */
async function downloadInstagramVideo(url: string, res: any) {
    try {
        if (!url.includes("instagram.com")) {
            return res.status(400).json({ error: "Invalid Instagram URL" });
        }

        const outputFilePath = path.join(__dirname, "..", "downloads", `instagram-video-${Date.now()}.mp4`);
        fs.ensureDirSync(path.join(__dirname, "..", "downloads"));

        const command = `yt-dlp -f best -o "${outputFilePath}" "${url}"`;
        console.log("Executing:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("yt-dlp Error:", error);
                return res.status(500).json({ error: "Failed to download Instagram video" });
            }

            streamAndDeleteFile(outputFilePath, res);
        });
    } catch (error) {
        console.error("Instagram Download Error:", error);
        res.status(500).json({ error: "Failed to process Instagram video download" });
    }
}

/**
 * Stream the downloaded file to the client and delete it after sending.
 */
function streamAndDeleteFile(filePath: string, res: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Disposition");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader("Content-Type", "video/mp4");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("close", () => {
        fs.removeSync(filePath);
    });
}

module.exports = {
    downloadYouTubeVideo,
    downloadFacebookVideo,
    downloadTwitterVideo,
    downloadTikTokVideo,
    downloadInstagramVideo
};
