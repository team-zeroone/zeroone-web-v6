require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const matter = require('gray-matter');
const { marked } = require('marked');
const FormData = require('form-data');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Configuration from Environment Variables
const WP_API_URL = process.env.WP_API_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Mode Flags
const isDryRun = process.argv.includes('--dry-run');

async function syncToWordPress() {
    console.log('--- Starting WordPress Sync ---');
    if (isDryRun) console.log('DRY RUN MODE ENABLED: No changes will be made to WordPress.');

    if (!WP_API_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
        throw new Error('WordPress credentials (WP_API_URL, WP_USERNAME, WP_APP_PASSWORD) are missing.');
    }

    // Auth header for REST API
    const wpAuth = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
    const wpHeaders = {
        'Authorization': `Basic ${wpAuth}`
    };

    // Get files to process from command line arguments
    const files = process.argv.slice(2).filter(arg => arg.endsWith('.md'));

    if (files.length === 0) {
        console.log('No Markdown files provided for sync.');
        return;
    }

    for (const filePath of files) {
        try {
            console.log(`\nProcessing: ${filePath}`);
            
            if (!fs.existsSync(filePath)) {
                console.log(`File does not exist: ${filePath}`);
                continue;
            }

            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContent);
            
            // 1. Prepare Content
            const htmlContent = marked(content);
            const slug = data.slug || path.basename(filePath, '.md');

            // 2. Handle Thumbnail / Featured Image
            let featuredImageId = null;
            if (data.image) {
                featuredImageId = await syncFeaturedImage(data.image, slug, wpHeaders);
            }

            // 3. Prepare Payload
            const payload = {
                title: data.title,
                content: htmlContent,
                status: 'publish',
                slug: slug,
                excerpt: data.excerpt || '',
                meta: {
                    stack: data.stack || '',
                    source: data.source || '',
                    live: data.live || ''
                }
            };

            if (featuredImageId) {
                payload.featured_media = featuredImageId;
            }

            if (isDryRun) {
                console.log('PLAN: Would Sync Post with payload:', JSON.stringify(payload, null, 2));
                continue;
            }

            // 4. Check if post exists
            const searchUrl = `${WP_API_URL}/wp/v2/portfolio?slug=${slug}&status=any`;
            const searchResponse = await axios.get(searchUrl, { headers: wpHeaders });
            const existingPost = searchResponse.data[0];

            if (existingPost) {
                console.log(`Updating existing post (ID: ${existingPost.id})...`);
                await axios.post(`${WP_API_URL}/wp/v2/portfolio/${existingPost.id}`, payload, { headers: wpHeaders });
                console.log('Successfully updated!');
            } else {
                console.log('Creating new post...');
                await axios.post(`${WP_API_URL}/wp/v2/portfolio`, payload, { headers: wpHeaders });
                console.log('Successfully created!');
            }

        } catch (err) {
            console.error(`Error processing ${filePath}:`, err.response?.data || err.message);
        }
    }
}

/**
 * Refined image downloader with anonymous/authenticated passes and 503 retry logic.
 */
async function downloadImageWithRetry(imageUrl, slug) {
    const maxRetries = 2;
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Pass 1: Try without token (GitHub often prefers this for public assets)
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempting anonymous download...`);
            return await axios.get(imageUrl, { 
                responseType: 'arraybuffer',
                headers: { 'User-Agent': userAgent }
            });
        } catch (err) {
            lastError = err;
            if (err.response?.status === 503 && i < maxRetries - 1) {
                console.warn('GitHub busy (503). Retrying in 2s...');
                await sleep(2000);
                continue;
            }
            break; 
        }
    }

    // Pass 2: Try with token (If Pass 1 failed with 401/403/404 or unknown error)
    if (GITHUB_TOKEN) {
        console.log(`Anonymous download failed or blocked. Trying with GITHUB_TOKEN...`);
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await axios.get(imageUrl, { 
                    responseType: 'arraybuffer',
                    headers: { 
                        'User-Agent': userAgent,
                        'Authorization': `token ${GITHUB_TOKEN}`
                    }
                });
            } catch (err) {
                lastError = err;
                if (err.response?.status === 503 && i < maxRetries - 1) {
                    console.warn('GitHub busy (503). Retrying in 2s...');
                    await sleep(2000);
                    continue;
                }
                break;
            }
        }
    }
    
    throw lastError || new Error('Image download failed');
}

/**
 * Syncs an image to the WP Media Library and returns the ID.
 */
async function syncFeaturedImage(imageUrl, slug, wpHeaders) {
    try {
        console.log(`Syncing image: ${imageUrl}`);
        
        // 1. Download image
        const imageResponse = await downloadImageWithRetry(imageUrl, slug);
        
        let fileName = `${slug}.png`;
        try {
            const urlPath = new URL(imageUrl).pathname;
            const ext = path.extname(urlPath);
            if (ext) fileName = `${slug}${ext}`;
        } catch (e) {
            // Fallback to .png if URL is weird
        }

        if (isDryRun) {
            console.log(`PLAN: Would upload image ${fileName} to Media Library.`);
            return 999; // Dummy ID
        }

        // 2. Upload to WP (With Retry for 503s)
        const formData = new FormData();
        formData.append('file', Buffer.from(imageResponse.data), {
            filename: fileName,
            contentType: imageResponse.headers['content-type']
        });

        let uploadResponse;
        const maxUploadRetries = 2;
        for (let j = 0; j < maxUploadRetries; j++) {
            try {
                console.log(`Uploading to WordPress Media...`);
                uploadResponse = await axios.post(`${WP_API_URL}/wp/v2/media`, formData, {
                    headers: {
                        ...wpHeaders,
                        ...formData.getHeaders(),
                        'User-Agent': 'ZeroOne-Portfolio-Agent/1.0'
                    }
                });
                break; // Success!
            } catch (uploadErr) {
                if (uploadErr.response?.status === 503 && j < maxUploadRetries - 1) {
                    console.warn(`WordPress host busy (503). Retrying upload in 3s...`);
                    await sleep(3000);
                    continue;
                }
                throw uploadErr; // Fail if not a 503 or no retries left
            }
        }

        console.log(`Image uploaded (ID: ${uploadResponse.data.id})`);
        return uploadResponse.data.id;

    } catch (err) {
        console.warn(`Failed to sync image. Server returned: ${err.message}`);
        if (err.config && err.config.url) {
            console.warn(`Error occurred while communicating with: ${err.config.url}`);
        }
        if (err.response && err.response.data) {
            console.warn(`Server Error Details:`, err.response.data);
        }
        return null;
    }
}

syncToWordPress();
