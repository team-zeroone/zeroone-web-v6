<?php
/**
 * The template for displaying the Portfolio Archive page.
 */

get_header(); ?>

<div id="primary" class="content-area" style="background-color: #222831; min-height: 100vh; padding: 100px 0;">
    <main id="main" class="site-main" role="main">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 40px;">
            
            <header class="zot-header">
                <div class="zot-kicker">
                    Selected Projects
                </div>
                <h1 class="zot-page-title">
                    A collection of precision-engineered digital products.
                </h1>
            </header>

            <?php echo do_shortcode('[zot_portfolio_grid]'); ?>

        </div>
    </main>
</div>

<?php get_footer(); ?>
