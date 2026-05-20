<?php
/**
 * The template for displaying single Portfolio projects.
 */

get_header(); ?>

<?php while (have_posts()):
    the_post(); ?>

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

        if ($hero_image_url): ?>
            <div class="zot-hero">
                <img src="<?php echo esc_url($hero_image_url); ?>" alt="Project Hero Image" id="hero-trigger">
            </div>

            <!-- Lightbox Overlay -->
            <div id="zot-lightbox" class="zot-lightbox">
                <div class="zot-lightbox-close">&times;</div>
                <div class="zot-lightbox-nav zot-lightbox-prev">&#10094;</div>
                <img src="<?php echo esc_url($hero_image_url); ?>" alt="Expanded View">
                <div class="zot-lightbox-nav zot-lightbox-next">&#10095;</div>
            </div>
        <?php endif; ?>

        <main id="main" class="site-main" role="main">
            <div class="container" style="max-width: 900px; margin: 0 auto; padding: 60px 24px;">

                <a href="<?php echo get_post_type_archive_link('portfolio'); ?>"
                    style="display: inline-flex; align-items: center; color: #aab4c0; text-decoration: none; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.2rem; margin-bottom: 48px; font-family: 'Outfit', sans-serif;">
                    &larr; Back to Portfolio
                </a>

                <header class="entry-header">
                    <h1 class="zot-entry-title">
                        <?php the_title(); ?>
                    </h1>
                </header>

                <!-- Meta Bar -->
                <?php echo do_shortcode('[zot_portfolio_meta]'); ?>

                <div class="entry-content"
                    style="font-family: 'Inter', sans-serif; line-height: 1.8; color: #aab4c0; font-size: 1.15rem; font-weight: 300;">
                    <?php the_content(); ?>
                </div>

                <!-- Gallery Section -->
                <?php echo do_shortcode('[zot_portfolio_gallery]'); ?>

                <footer class="entry-footer"
                    style="margin: 120px 0 80px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                    <span
                        style="font-family: 'Outfit', sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: #aab4c0; opacity: 0.6; display: block; margin-bottom: 16px;">
                        Next Project
                    </span>
                    <?php
                    // Use get_next_post() because the grid is sorted chronologically ascending (first created first)
                    $next_post = get_next_post();
                    if (!empty($next_post)): ?>
                        <a href="<?php echo get_permalink($next_post->ID); ?>"
                            style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: #ffffff; text-decoration: none;">
                            <?php echo esc_html($next_post->post_title); ?> &rarr;
                        </a>
                    <?php endif; ?>
                </footer>

            </div>
        </main>
    </div>

<?php endwhile; ?>

<?php get_footer(); ?>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const heroTrigger = document.getElementById('hero-trigger');
        const lightbox = document.getElementById('zot-lightbox');
        const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
        const prevBtn = lightbox ? lightbox.querySelector('.zot-lightbox-prev') : null;
        const nextBtn = lightbox ? lightbox.querySelector('.zot-lightbox-next') : null;

        let allImages = [];
        let currentIdx = 0;

        if (heroTrigger) allImages.push(heroTrigger.src);
        const galleryTriggers = document.querySelectorAll('.gallery-trigger img');
        galleryTriggers.forEach(img => allImages.push(img.src));

        function openLightbox(src) {
            if (lightbox && lightboxImg) {
                currentIdx = allImages.indexOf(src);
                if(currentIdx === -1) currentIdx = 0;
                
                // Only show arrows if there's more than 1 image
                if (allImages.length <= 1) {
                    if (prevBtn) prevBtn.style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'none';
                }

                lightboxImg.src = src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        function changeImage(direction) {
            if (allImages.length <= 1) return;
            currentIdx += direction;
            if (currentIdx < 0) currentIdx = allImages.length - 1;
            if (currentIdx >= allImages.length) currentIdx = 0;
            lightboxImg.src = allImages[currentIdx];
        }

        if (heroTrigger) {
            heroTrigger.addEventListener('click', () => openLightbox(heroTrigger.src));
        }

        galleryTriggers.forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src));
        });

        if (lightbox && lightboxImg) {
            // Image Tap-to-Zoom
            lightboxImg.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent background click from closing
                lightbox.classList.toggle('zoomed-active');
            });

            // Arrow Navigation
            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    changeImage(-1);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    changeImage(1);
                });
            }

            // Swipe Navigation
            let touchstartX = 0;
            let touchendX = 0;
            
            lightbox.addEventListener('touchstart', e => {
                touchstartX = e.changedTouches[0].screenX;
            }, {passive: true});

            lightbox.addEventListener('touchend', e => {
                if (lightbox.classList.contains('zoomed-active')) return; // Don't swipe if zoomed
                touchendX = e.changedTouches[0].screenX;
                if (touchendX < touchstartX - 50) changeImage(1); // Swipe left = next
                if (touchendX > touchstartX + 50) changeImage(-1); // Swipe right = prev
            });

            // Background click to close
            lightbox.addEventListener('click', () => {
                lightbox.classList.remove('active');
                lightbox.classList.remove('zoomed-active');
                document.body.style.overflow = '';
            });
        }
    });
</script>