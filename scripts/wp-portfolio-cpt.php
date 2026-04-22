<?php
/**
 * Plugin Name: ZeroOne Portfolio Custom Post Type
 * Description: Registers the Portfolio CPT and exposes custom meta to the REST API.
 * Version: 1.0
 * Author: ZeroOne Agent
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function zot_register_portfolio_cpt() {
    $labels = array(
        'name'               => 'Portfolio',
        'singular_name'      => 'Project',
        'add_new'            => 'Add New',
        'add_new_item'       => 'Add New Project',
        'edit_item'          => 'Edit Project',
        'new_item'           => 'New Project',
        'view_item'          => 'View Project',
        'search_items'       => 'Search Projects',
        'not_found'          => 'No projects found',
        'all_items'          => 'All Projects',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true, // CRITICAL: Enables Block Editor & REST API
        'menu_icon'          => 'dashicons-portfolio',
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'rewrite'            => array( 'slug' => 'projects' ),
    );

    register_post_type( 'portfolio', $args );

    // Register Meta Fields for the REST API
    $meta_fields = array('stack', 'source', 'live');
    foreach ($meta_fields as $field) {
        register_post_meta('portfolio', $field, array(
            'show_in_rest' => true,
            'single'       => true,
            'type'         => 'string',
        ));
    }
}
add_action( 'init', 'zot_register_portfolio_cpt' );
