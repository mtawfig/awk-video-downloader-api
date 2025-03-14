const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra"); // Use puppeteer-extra instead of puppeteer
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const cheerio = require("cheerio");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const util = require("util");

// Add stealth plugin to avoid detection (for instagram using puppeteerExtra)
puppeteerExtra.use(StealthPlugin());

const execPromise = util.promisify(exec);
const app = express();
const PORT = process.env.PORT || 5000;

//app.use(cors());
// Apply CORS middleware to allow all origins and headers
app.use(cors({
    origin: "*", // Allow all origins
    methods: "GET, POST, OPTIONS", // Allow necessary HTTP methods
    allowedHeaders: "Content-Type, Authorization, Content-Disposition", // Allow required headers
    exposedHeaders: "Content-Disposition" ,// Expose headers needed for file downloads
	credentials: true, // Allow credentials (e.g., cookies)
}));

// Handle preflight CORS requests
app.options("*", cors());

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
 * Fetch metadata for a YouTube video.
 */
async function getYouTubeMetadata(url) {
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
async function getFacebookMetadata(url) {
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
                thumbnail: document.querySelector('meta[property="og:image"]')?.content || "",
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
async function getTwitterMetadata(url) {
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
async function getTikTokMetadata(url) {
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
async function getInstagramMetadata(url) {
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


/**
 * Download YouTube video.
 */
async function downloadYouTubeVideo(url, res) {
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
    } catch (error) {
        console.error("YouTube Download Error:", error);
        res.status(500).json({ error: "Failed to process YouTube video download" });
    }

}

/**
 * Download Facebook video.
 */
async function downloadFacebookVideo(url, res) {
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
    } catch (error) {
        console.error("Facebook Download Error:", error);
        res.status(500).json({ error: "Failed to process Facebook video download" });
    }
}

/**
 * Download Twitter video.
 */
async function downloadTwitterVideo(url, res) {
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
    } catch (error) {
        console.error("Error fetching Twitter video:", error);
        res.status(500).json({ error: "Failed to download Twitter video" });
    }
}

/**
 * Download TikTok video.
 */
async function downloadTikTokVideo(url, res) {
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
    } catch (error) {
        res.status(500).json({ error: "Failed to download TikTok video" });
    }
}

/**
 * Download Instagram Video
 */
async function downloadInstagramVideo(url, res) {
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
    } catch (error) {
        console.error("Instagram Reels Download Error:", error);
        res.status(500).json({ error: "Failed to process Instagram Reels download" });
    }
}




/**
 * Main API Endpoint: Detects video source and fetches metadata.
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
	if (source === "instagram") metadata = await downloadInstagramVideo(url, res);
    else return res.status(400).json({ error: "Unsupported video source" });
});



/**
 * Start the server.
 */

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
