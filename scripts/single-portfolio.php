<?php
/**
 * The template for displaying single Portfolio projects.
 */

get_header(); ?>

<?php while ( have_posts() ) : the_post(); ?>

<div id="primary" class="content-area" style="background-color: #222831; color: #ffffff; min-height: 100vh;">
    
    <!-- Hero Section -->
    <?php 
    $hero_image_id = get_post_meta(get_the_ID(), 'hero_image_id', true);
    $hero_image_url = '';
    
    if ($hero_image_id) {
        $hero_image_url = wp_get_attachment_image_url($hero_image_id, 'full');
    }
    
    if (!$hero_image_url && has_post_thumbnail()) {
        $hero_image_url = get_the_post_thumbnail_url(get_the_ID(), 'full');
    }

    if ( $hero_image_url ) : ?>
        <div class="zot-hero">
            <img src="<?php echo esc_url($hero_image_url); ?>" alt="Project Hero Image">
        </div>
    <?php endif; ?>

    <main id="main" class="site-main" role="main">
        <div class="container" style="max-width: 900px; margin: 0 auto; padding: 60px 24px;">
            
            <a href="<?php echo get_post_type_archive_link('portfolio'); ?>" style="display: inline-flex; align-items: center; color: #aab4c0; text-decoration: none; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.2rem; margin-bottom: 48px; font-family: 'Outfit', sans-serif;">
                &larr; Back to Works
            </a>

            <header class="entry-header">
                <h1 class="zot-entry-title">
                    <?php the_title(); ?>
                </h1>
            </header>

            <!-- Meta Bar -->
            <?php echo do_shortcode('[zot_portfolio_meta]'); ?>

            <div class="entry-content" style="font-family: 'Inter', sans-serif; line-height: 1.8; color: #aab4c0; font-size: 1.15rem; font-weight: 300;">
                <?php the_content(); ?>
            </div>

            <footer class="entry-footer" style="margin: 120px 0 80px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                <span style="font-family: 'Outfit', sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: #aab4c0; opacity: 0.6; display: block; margin-bottom: 16px;">
                    Next Project
                </span>
                <?php 
                $next_post = get_next_post();
                if ( ! empty( $next_post ) ) : ?>
                    <a href="<?php echo get_permalink( $next_post->ID ); ?>" style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: #ffffff; text-decoration: none;">
                        <?php echo esc_html( $next_post->post_title ); ?> &rarr;
                    </a>
                <?php endif; ?>
            </footer>

        </div>
    </main>
</div>

<?php endwhile; ?>

<?php get_footer(); ?>
