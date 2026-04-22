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

// Local WP Live Link Basic Auth (Optional)
const WP_LIVE_USER = process.env.WP_LIVE_USER;
const WP_LIVE_PASS = process.env.WP_LIVE_PASS;

// Mode Flags
const isDryRun = process.argv.includes('--dry-run');

async function syncToWordPress() {
    console.log('--- Starting WordPress Sync ---');
    if (isDryRun) console.log('DRY RUN MODE ENABLED: No changes will be made to WordPress.');

    if (!WP_API_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
        throw new Error('WordPress credentials (WP_API_URL, WP_USERNAME, WP_APP_PASSWORD) are missing.');
    }

    // 1. Handle Local WP Live Link "Double Lock"
    let targetApiUrl = WP_API_URL;
    if (WP_LIVE_USER && WP_LIVE_PASS) {
        console.log('Injecting Live Link credentials into URL...');
        // Standard URL injection: https://user:pass@domain.com/wp-json
        const urlObj = new URL(WP_API_URL);
        urlObj.username = WP_LIVE_USER;
        urlObj.password = WP_LIVE_PASS;
        targetApiUrl = urlObj.toString();
    }

    // 2. Auth header for REST API (The WordPress User)
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
            const searchUrl = `${targetApiUrl}/wp/v2/portfolio?slug=${slug}&status=any`;
            const searchResponse = await axios.get(searchUrl, { headers: wpHeaders });
            const existingPost = searchResponse.data[0];

            if (existingPost) {
                console.log(`Updating existing post (ID: ${existingPost.id})...`);
                await axios.post(`${targetApiUrl}/wp/v2/portfolio/${existingPost.id}`, payload, { headers: wpHeaders });
                console.log('Successfully updated!');
            } else {
                console.log('Creating new post...');
                await axios.post(`${targetApiUrl}/wp/v2/portfolio`, payload, { headers: wpHeaders });
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
async function syncFeaturedImage(imageUrl, slug, wpHeaders) {
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
        const fileName = `${slug}${path.extname(new URL(imageUrl).pathname) || '.png'}`;

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

        const uploadResponse = await axios.post(`${targetApiUrl}/wp/v2/media`, formData, {
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
