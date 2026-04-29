require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const matter = require('gray-matter');
const { marked } = require('marked');
const FormData = require('form-data');
const sharp = require('sharp');

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

    // Get files to process (Added/Modified)
    let files = [];
    if (process.env.ALL_CHANGED_FILES) {
        files = process.env.ALL_CHANGED_FILES.split(' ').filter(f => f.endsWith('.md'));
    } else {
        files = process.argv.slice(2).filter(arg => arg.endsWith('.md'));
    }

    if (files.length > 0) {
        console.log(`\n--- Syncing ${files.length} added/modified file(s) ---`);
        for (const filePath of files) {
            try {
                console.log(`\nProcessing: ${filePath}`);
                
                if (!fs.existsSync(filePath)) {
                    console.log(`File does not exist (possibly deleted): ${filePath}`);
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

                // Also Handle Hero Image (if provided)
                let heroImageId = null;
                if (data.hero_image) {
                    heroImageId = await syncFeaturedImage(data.hero_image, `${slug}-hero`, wpHeaders);
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
                        live: data.live || '',
                        hero_image_id: heroImageId ? String(heroImageId) : '',
                        project_type: data.type || ''
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
    } else {
        console.log('No new or modified Markdown files to sync.');
    }


    // 5. Handle Deleted Files — Trash corresponding WordPress posts
    const deletedFiles = (process.env.DELETED_FILES || '').trim();
    if (deletedFiles) {
        const deletedPaths = deletedFiles.split(' ').filter(f => f.endsWith('.md'));
        console.log(`\n--- Processing ${deletedPaths.length} deleted file(s) ---`);

        for (const deletedPath of deletedPaths) {
            try {
                const deletedSlug = path.basename(deletedPath, '.md');
                console.log(`\nLooking up WordPress post for deleted file: ${deletedSlug}`);

                const searchUrl = `${WP_API_URL}/wp/v2/portfolio?slug=${deletedSlug}&status=any`;
                const searchResponse = await axios.get(searchUrl, { headers: wpHeaders });
                const existingPost = searchResponse.data[0];

                if (existingPost) {
                    if (isDryRun) {
                        console.log(`PLAN: Would trash post "${existingPost.title.rendered}" (ID: ${existingPost.id})`);
                        continue;
                    }
                    console.log(`Trashing post "${existingPost.title.rendered}" (ID: ${existingPost.id})...`);
                    await axios.delete(`${WP_API_URL}/wp/v2/portfolio/${existingPost.id}`, { headers: wpHeaders });
                    console.log('Successfully trashed!');
                } else {
                    console.log(`No WordPress post found for slug "${deletedSlug}". Skipping.`);
                }
            } catch (err) {
                console.error(`Error deleting post for ${deletedPath}:`, err.response?.data || err.message);
            }
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
        
        // 0. Check if this image already exists in the WP Media Library (prevent duplicates)
        try {
            const searchResponse = await axios.get(`${WP_API_URL}/wp/v2/media?search=${slug}&per_page=5`, {
                headers: wpHeaders
            });
            const existing = searchResponse.data.find(m => 
                m.slug && m.slug.startsWith(slug)
            );
            if (existing) {
                console.log(`Image already exists in Media Library (ID: ${existing.id}, slug: ${existing.slug}). Skipping upload.`);
                return existing.id;
            }
        } catch (searchErr) {
            console.warn(`Could not search media library (${searchErr.message}). Will proceed with upload.`);
        }

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

        // 1.5 Optimize image before upload to prevent WordPress 503 errors
        console.log('Optimizing image for WordPress...');
        const optimizedBuffer = await sharp(imageResponse.data)
            .resize({ width: 1200, withoutEnlargement: true })
            .toBuffer();
        
        console.log(`Optimization complete (${Math.round(imageResponse.data.length/1024)}KB -> ${Math.round(optimizedBuffer.length/1024)}KB)`);

        // 2. Upload to WP (With Retry for 503s)
        const formData = new FormData();
        formData.append('file', optimizedBuffer, {
            filename: fileName,
            contentType: imageResponse.headers['content-type']
        });

        let uploadResponse;
        const maxUploadRetries = 2;
        for (let j = 0; j < maxUploadRetries; j++) {
            try {
                console.log(`Uploading to WordPress Media (This can take up to 2 minutes)...`);
                uploadResponse = await axios.post(`${WP_API_URL}/wp/v2/media`, formData, {
                    timeout: 120000, // 2-minute safety timeout
                    headers: {
                        ...wpHeaders,
                        ...formData.getHeaders(),
                        'User-Agent': 'ZeroOne-Portfolio-Agent/1.0'
                    }
                });
                break; // Success!
            } catch (uploadErr) {
                if (uploadErr.code === 'ECONNABORTED') {
                    console.error('WordPress took too long to respond (> 2 mins). Skipping image for now.');
                    break;
                }
                if (uploadErr.response?.status === 503 && j < maxUploadRetries - 1) {
                    console.warn(`WordPress host busy (503). Retrying upload in 5s...`);
                    await sleep(5000);
                    continue;
                }
                throw uploadErr;
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
