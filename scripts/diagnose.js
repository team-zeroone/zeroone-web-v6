require('dotenv').config();
const axios = require('axios');

const WP_API_URL = process.env.WP_API_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

const wpAuth = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
const wpHeaders = { 'Authorization': `Basic ${wpAuth}` };

async function diagnose() {
    console.log('=== DEEP AUTH DIAGNOSTIC ===\n');

    // 1. Who does WordPress think I am?
    console.log('1. Checking authenticated user identity...');
    try {
        const res = await axios.get(`${WP_API_URL}/wp/v2/users/me?context=edit`, { headers: wpHeaders, timeout: 15000 });
        console.log(`   ✅ Logged in as: "${res.data.name}" (ID: ${res.data.id})`);
        console.log(`   Roles: ${JSON.stringify(res.data.roles)}`);
        console.log(`   Capabilities (upload): ${res.data.capabilities?.upload_files}`);
        console.log(`   Capabilities (edit_posts): ${res.data.capabilities?.edit_posts}`);
    } catch (e) {
        console.log(`   ❌ Auth check failed: ${e.response ? e.response.status + ' ' + JSON.stringify(e.response.data).substring(0, 200) : e.message}`);
    }

    // 2. Can we create a simple media entry (no file)?
    console.log('\n2. Testing media endpoint permissions...');
    try {
        const res = await axios.options(`${WP_API_URL}/wp/v2/media`, { headers: wpHeaders, timeout: 15000 });
        console.log(`   OPTIONS status: ${res.status}`);
        console.log(`   Allow header: ${res.headers['allow']}`);
    } catch (e) {
        console.log(`   ❌ Options check: ${e.response ? e.response.status : e.message}`);
    }

    // 3. Try uploading a tiny 1x1 pixel PNG
    console.log('\n3. Testing upload with minimal 1x1 pixel image...');
    const FormData = require('form-data');
    const sharp = require('sharp');
    
    try {
        const tinyPng = await sharp({ create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toBuffer();
        console.log(`   Generated test image: ${tinyPng.length} bytes`);

        const formData = new FormData();
        formData.append('file', tinyPng, { filename: 'test-pixel.png', contentType: 'image/png' });

        const uploadRes = await axios.post(`${WP_API_URL}/wp/v2/media`, formData, {
            timeout: 30000,
            headers: { ...wpHeaders, ...formData.getHeaders() }
        });
        console.log(`   ✅ Upload SUCCESS! Media ID: ${uploadRes.data.id}`);
        console.log(`   URL: ${uploadRes.data.source_url}`);
    } catch (e) {
        console.log(`   ❌ Upload failed: ${e.response ? e.response.status : e.message}`);
        if (e.response && e.response.data) {
            console.log(`   Response:`, JSON.stringify(e.response.data).substring(0, 500));
        }
        if (e.response && e.response.headers) {
            console.log(`   Server: ${e.response.headers['server'] || 'unknown'}`);
            console.log(`   X-Powered-By: ${e.response.headers['x-powered-by'] || 'unknown'}`);
        }
    }

    console.log('\n=== DIAGNOSTIC COMPLETE ===');
}

diagnose();
