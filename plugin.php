<?php
/**
 * Plugin Name: MvM Annotations
 * Plugin URI: https://github.com/ahmadawais/create-guten-block/
 * Description: annotations — is a Gutenberg plugin created via create-guten-block.
 * Author: Ellen M Bartling
 * Author URI: https://ellenbartling.design/
 * Version: 1.0.1
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
