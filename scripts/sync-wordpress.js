require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const matter = require('gray-matter');
const { marked } = require('marked');
const FormData = require('form-data');

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
                featuredImageId = await syncFeaturedImage(data.image, slug, wpHeaders, WP_API_URL);
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
 * Syncs an image to the WP Media Library and returns the ID.
 */
async function syncFeaturedImage(imageUrl, slug, wpHeaders, targetApiUrl) {
    try {
        console.log(`Syncing image: ${imageUrl}`);
        
        // 1. Download image
        const axiosOptions = { responseType: 'arraybuffer' };
        
        // If it's a GitHub attachment, add authentication
        if (imageUrl.includes('github.com') || imageUrl.includes('githubusercontent.com')) {
            if (GITHUB_TOKEN) {
                axiosOptions.headers = { 'Authorization': `token ${GITHUB_TOKEN}` };
            }
        }

        const imageResponse = await axios.get(imageUrl, axiosOptions);
        
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

        // 2. Upload to WP
        const formData = new FormData();
        formData.append('file', Buffer.from(imageResponse.data), {
            filename: fileName,
            contentType: imageResponse.headers['content-type']
        });

        const uploadResponse = await axios.post(`${WP_API_URL}/wp/v2/media`, formData, {
            headers: {
                ...wpHeaders,
                ...formData.getHeaders()
            }
        });

        console.log(`Image uploaded (ID: ${uploadResponse.data.id})`);
        return uploadResponse.data.id;

    } catch (err) {
        console.warn('Failed to sync image:', err.message);
        return null;
    }
}

syncToWordPress();
