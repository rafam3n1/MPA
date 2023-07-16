<?php

function mpa_total_authorized_subscribers() {
    global $wpdb;
    $count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}mpa_subscribers WHERE user_plan_status = 'authorized'");
    return $count;
}

function mpa_total_wc_subscribers() {
    $args = array(
        'subscriptions_per_page' => -1,
        'subscription_status' => 'active',
    );
    $subscriptions = wcs_get_subscriptions($args);
    return count($subscriptions);
}

function mpa_add_total_subscribers_to_admin_bar($wp_admin_bar) {
    $total_authorized = mpa_total_authorized_subscribers();
    $total_wc = mpa_total_wc_subscribers();
    $total = $total_authorized + $total_wc;

    $args = array(
        'id' => 'mpa_total_subscribers',
        'title' => "Total de assinantes ativos = ($total)",
    );
    $wp_admin_bar->add_node($args);
}
add_action('admin_bar_menu', 'mpa_add_total_subscribers_to_admin_bar', 999);

