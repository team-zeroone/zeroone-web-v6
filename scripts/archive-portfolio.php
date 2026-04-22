<?php
/**
 * The template for displaying the Portfolio Archive page.
 */

get_header(); ?>

<div id="primary" class="content-area" style="background-color: #222831; min-height: 100vh; padding: 100px 0;">
    <main id="main" class="site-main" role="main">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 40px;">
            
            <header class="page-header" style="margin-bottom: 120px; max-width: 900px;">
                <div style="font-family: 'Outfit', sans-serif; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.4em; color: #aab4c0; margin-bottom: 32px; font-weight: 500; opacity: 0.7;">
                    Selected Projects
                </div>
                <h1 class="page-title" style="font-family: 'Outfit', sans-serif; font-size: 4rem; font-weight: 400; line-height: 1.1; letter-spacing: -0.02em; color: #ffffff;">
                    A collection of precision-engineered digital products.
                </h1>
            </header>

            <?php echo do_shortcode('[zot_portfolio_grid]'); ?>

        </div>
    </main>
</div>

<?php get_footer(); ?>
