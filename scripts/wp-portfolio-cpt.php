<?php
/**
 * Plugin Name: ZeroOne Portfolio Custom Post Type
 * Description: Registers the Portfolio CPT, custom meta, and provides the Zen-Minimal Design System via shortcodes.
 * Version: 2.0
 * Author: Megha Jayalath
 */

if (!defined('ABSPATH'))
    exit;

// 1. Register CPT
function zot_register_portfolio_cpt()
{
    $labels = array(
        'name' => 'Portfolio',
        'singular_name' => 'Project',
        'add_new' => 'Add New',
        'add_new_item' => 'Add New Project',
        'edit_item' => 'Edit Project',
        'new_item' => 'New Project',
        'view_item' => 'View Project',
        'search_items' => 'Search Projects',
        'not_found' => 'No projects found',
        'all_items' => 'All Projects',
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-portfolio',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'rewrite' => array('slug' => 'projects'),
    );

    register_post_type('portfolio', $args);

    $meta_fields = array('stack', 'source', 'live', 'hero_image_id', 'project_type', 'gallery_image_ids');
    foreach ($meta_fields as $field) {
        register_post_meta('portfolio', $field, array(
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
        ));
    }
}
add_action('init', 'zot_register_portfolio_cpt');

// 2. Inject Zen-Minimal Design System (CSS)
function zot_portfolio_styles()
{
    ?>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap');

        :root {
            --zot-bg: #222831;
            --zot-card-bg: #1a1f26;
            --zot-text: #ffffff;
            --zot-muted: #aab4c0;
            --zot-border: rgba(255, 255, 255, 0.06);
            --zot-accent: #ffffff;
        }

        .zot-grid-container {
            font-family: 'Inter', sans-serif;
            color: var(--zot-text);
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .zot-header {
            margin-bottom: 80px;
            max-width: 900px;
        }

        .zot-kicker {
            font-family: 'Outfit', sans-serif;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: var(--zot-muted);
            margin-bottom: 32px;
            font-weight: 500;
            opacity: 0.7;
        }

        .zot-page-title {
            font-family: 'Outfit', sans-serif;
            font-size: clamp(2.5rem, 8vw, 4rem);
            font-weight: 400;
            line-height: 1.1;
            letter-spacing: -0.02em;
            color: #ffffff;
            margin: 0;
        }

        .zot-entry-title {
            font-family: 'Outfit', sans-serif;
            font-size: clamp(3rem, 10vw, 4.5rem);
            font-weight: 400;
            line-height: 1.1;
            margin-bottom: 40px;
            letter-spacing: -0.03em;
            color: #ffffff;
        }

        .zot-hero {
            width: 100%;
            height: clamp(300px, 60vh, 800px);
            background: #111;
            overflow: hidden;
            border-bottom: 1px solid var(--zot-border);
        }

        .zot-hero img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 1;
            cursor: pointer;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .zot-hero img:hover {
            transform: scale(1.02);
        }

        /* Lightbox */
        .zot-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(17, 17, 17, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
            padding: 40px;
        }

        .zot-lightbox.active {
            opacity: 1;
            pointer-events: auto;
        }

        .zot-lightbox img {
            max-width: 900px;
            max-height: 80vh;
            object-fit: contain;
            box-shadow: 0 40px 100px rgba(0,0,0,0.8);
            transform: scale(0.9);
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .zot-lightbox.active img {
            transform: scale(1);
        }

        /* Gallery Grid (Bento style) */
        .zot-gallery-container {
            margin: 80px 0;
            width: 100%;
        }

        .zot-gallery-title {
            font-family: 'Outfit', sans-serif;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--zot-muted);
            margin-bottom: 32px;
            display: block;
            opacity: 0.6;
        }

        .zot-gallery-grid {
            column-count: 3;
            column-gap: 20px;
            width: 100%;
        }

        .zot-gallery-item {
            display: inline-block;
            width: 100%;
            margin-bottom: 20px;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid var(--zot-border);
            cursor: zoom-in;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            background: #111;
        }

        .zot-gallery-item:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .zot-gallery-item img {
            width: 100%;
            height: auto;
            display: block;
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .zot-gallery-item:hover img {
            transform: scale(1.05);
        }

        @media (max-width: 1024px) {
            .zot-gallery-grid {
                column-count: 2;
            }
        }

        @media (max-width: 600px) {
            .zot-gallery-grid {
                column-count: 1;
            }
        }

        /* Grid */
        .zot-project-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 60px 40px;
        }

        .zot-card {
            text-decoration: none !important;
            color: inherit !important;
            display: block;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .zot-card-img {
            width: 100%;
            aspect-ratio: 16/10;
            background: #111;
            border: 1px solid var(--zot-border);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 24px;
            transition: inherit;
        }

        .zot-card-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: grayscale(10%);
            transition: inherit;
        }

        .zot-card:hover .zot-card-img {
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }

        .zot-card:hover .zot-card-img img {
            transform: scale(1.04);
            filter: grayscale(0%);
        }

        .zot-card-cat {
            font-family: 'Outfit', sans-serif;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--zot-muted);
            margin-bottom: 12px;
            display: block;
            opacity: 0.6;
        }

        .zot-card-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            font-weight: 400;
            margin: 0 0 16px 0;
        }

        .zot-card-excerpt {
            color: var(--zot-muted);
            font-size: 1rem;
            font-weight: 300;
            line-height: 1.6;
        }

        .zot-card-line {
            margin-top: 32px;
            height: 1px;
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            position: relative;
            overflow: hidden;
        }

        .zot-card-line::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            transform: translateX(-101%);
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .zot-card:hover .zot-card-line::after {
            transform: translateX(0);
        }

        /* Meta Bar (Single Page) */
        .zot-meta-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 40px;
            padding: 30px 0;
            border-top: 1px solid var(--zot-border);
            border-bottom: 1px solid var(--zot-border);
            margin: 40px 0 60px;
            font-family: 'Inter', sans-serif;
        }

        .zot-meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .zot-meta-label {
            font-family: 'Outfit', sans-serif;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--zot-muted);
            opacity: 0.6;
        }

        .zot-meta-val {
            font-size: 0.9rem;
            color: #fff;
        }

        .zot-meta-val a {
            color: #fff;
            text-decoration: underline;
            text-underline-offset: 3px;
        }

        @media (max-width: 1024px) {
            .zot-project-grid {
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .zot-project-grid {
                grid-template-columns: 1fr;
            }

            .zot-header {
                margin-bottom: 60px;
            }

            .zot-grid-container {
                padding: 40px 0;
            }

            .zot-meta-bar {
                gap: 24px;
                padding: 20px 0;
            }
        }
    </style>
    <?php
}
add_action('wp_head', 'zot_portfolio_styles');

// 3. Shortcode: [zot_portfolio_grid]
function zot_portfolio_grid_shortcode()
{
    $query = new WP_Query(array(
        'post_type' => 'portfolio',
        'posts_per_page' => -1,
        'status' => 'publish'
    ));

    if (!$query->have_posts())
        return '<p>No projects found.</p>';

    $output = '<div class="zot-grid-container"><div class="zot-project-grid">';

    while ($query->have_posts()) {
        $query->the_post();
        $thumb = get_the_post_thumbnail_url(get_the_ID(), 'large') ?: 'https://ui.shadcn.com/placeholder.svg';
        $type = get_post_meta(get_the_ID(), 'project_type', true);

        $output .= sprintf(
            '<a href="%s" class="zot-card">
                <div class="zot-card-img"><img src="%s" alt="%s"></div>
                <span class="zot-card-cat">%s</span>
                <h3 class="zot-card-title">%s</h3>
                <p class="zot-card-excerpt">%s</p>
                <div class="zot-card-line"></div>
            </a>',
            get_permalink(),
            $thumb,
            get_the_title(),
            $type ?: 'Project',
            get_the_title(),
            get_the_excerpt()
        );
    }

    $output .= '</div></div>';
    wp_reset_postdata();
    return $output;
}
add_shortcode('zot_portfolio_grid', 'zot_portfolio_grid_shortcode');

// 4. Shortcode: [zot_portfolio_meta]
function zot_portfolio_meta_shortcode()
{
    global $post;
    if ($post->post_type !== 'portfolio')
        return '';

    $stack = get_post_meta($post->ID, 'stack', true);
    $live = get_post_meta($post->ID, 'live', true);
    $source = get_post_meta($post->ID, 'source', true);

    // Sanitize missing fields that might have old github issue placeholders
    if ($stack === '_No response_')
        $stack = '';
    if ($live === '_No response_')
        $live = '';
    if ($source === '_No response_')
        $source = '';

    $output = '<div class="zot-meta-bar">';

    if ($stack) {
        $output .= '<div class="zot-meta-item"><span class="zot-meta-label">Technologies</span><span class="zot-meta-val">' . esc_html($stack) . '</span></div>';
    }

    if ($live) {
        $output .= '<div class="zot-meta-item"><span class="zot-meta-label">Live Project</span><span class="zot-meta-val"><a href="' . esc_url($live) . '" target="_blank">Visit Website</a></span></div>';
    }

    if ($source) {
        $source_label = 'View Source';
        if (strpos($source, 'figma.com') !== false) {
            $source_label = 'View Design';
        } elseif (strpos($source, 'dribbble.com') !== false || strpos($source, 'behance.net') !== false) {
            $source_label = 'View Portfolio';
        } elseif (strpos($source, 'github.com') !== false) {
            $source_label = 'View Code';
        }

        $output .= '<div class="zot-meta-item"><span class="zot-meta-label">Project File</span><span class="zot-meta-val"><a href="' . esc_url($source) . '" target="_blank">' . esc_html($source_label) . '</a></span></div>';
    }

    $output .= '</div>';
    return $output;
}
add_shortcode('zot_portfolio_meta', 'zot_portfolio_meta_shortcode');

// 5. Shortcode: [zot_portfolio_gallery]
function zot_portfolio_gallery_shortcode()
{
    global $post;
    if ($post->post_type !== 'portfolio')
        return '';

    $gallery_ids_str = get_post_meta($post->ID, 'gallery_image_ids', true);
    if (!$gallery_ids_str)
        return '';

    $gallery_ids = array_filter(explode(',', $gallery_ids_str));
    if (empty($gallery_ids))
        return '';

    $output = '<div class="zot-gallery-container">';
    $output .= '<span class="zot-gallery-title">Gallery</span>';
    $output .= '<div class="zot-gallery-grid">';

    foreach ($gallery_ids as $id) {
        $img_url = wp_get_attachment_image_url($id, 'full');
        if ($img_url) {
            $output .= sprintf(
                '<div class="zot-gallery-item gallery-trigger">
                    <img src="%s" alt="Project Gallery Image">
                </div>',
                esc_url($img_url)
            );
        }
    }

    $output .= '</div></div>';
    return $output;
}
add_shortcode('zot_portfolio_gallery', 'zot_portfolio_gallery_shortcode');
