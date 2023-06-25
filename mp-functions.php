<?php
/*
Plugin Name: MP Assinaturas
Plugin URI: https://tornevirtual.com.br
Description: Plugin para integrar assinaturas do Mercado Pago com o WooCommerce.
Version: 1.0
Author: rafam3n
Author URI: https://tornevirtual.com.br
*/

// Inclua os arquivos de configurações e endpoint
include('mpa-settings.php');
include('mpa-endpoint.php');

// Adicione os campos ao formulário de perfil do usuário
function mpa_add_custom_user_profile_fields($user) {
    ?>
    <h3><?php _e('Informações de Assinatura do Mercado Pago', 'mpa'); ?></h3>
    
    <table class="form-table">
        <tr>
            <th>
                <label for="mpa_token"><?php _e('Token do Mercado Pago', 'mpa'); ?></label>
            </th>
            <td>
                <input type="text" name="mpa_token" id="mpa_token" value="<?php echo esc_attr(get_the_author_meta('mpa_token', $user->ID)); ?>" class="regular-text" /><br />
                <span class="description"><?php _e('Por favor insira o token do Mercado Pago.', 'mpa'); ?></span>
            </td>
        </tr>
        <tr>
            <th>
                <label for="mpa_subscription_id"><?php _e('ID da Assinatura', 'mpa'); ?></label>
            </th>
            <td>
                <input type="text" name="mpa_subscription_id" id="mpa_subscription_id" value="<?php echo esc_attr(get_the_author_meta('mpa_subscription_id', $user->ID)); ?>" class="regular-text" /><br />
                <span class="description"><?php _e('Por favor insira o ID da assinatura.', 'mpa'); ?></span>
            </td>
        </tr>
        <tr>
            <th>
                <label for="mpa_status"><?php _e('Status', 'mpa'); ?></label>
            </th>
            <td>
                <input type="text" name="mpa_status" id="mpa_status" value="<?php echo esc_attr(get_the_author_meta('mpa_status', $user->ID)); ?>" class="regular-text" /><br />
                <span class="description"><?php _e('Por favor insira o status da assinatura.', 'mpa'); ?></span>
            </td>
        </tr>
    </table>
    <?php
}

add_action('show_user_profile', 'mpa_add_custom_user_profile_fields');
add_action('edit_user_profile', 'mpa_add_custom_user_profile_fields');

// Salve os dados do formulário de perfil do usuário
function mpa_save_custom_user_profile_fields($user_id) {
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }

    update_user_meta($user_id, 'mpa_token', $_POST['mpa_token']);
    update_user_meta($user_id, 'mpa_subscription_id', $_POST['mpa_subscription_id']);
    update_user_meta($user_id, 'mpa_status', $_POST['mpa_status']);
}

add_action('personal_options_update', 'mpa_save_custom_user_profile_fields');
add_action('edit_user_profile_update', 'mpa_save_custom_user_profile_fields');

function mpa_enqueue_scripts() {
    wp_enqueue_script('mpa-ajax-sync', plugin_dir_url(__FILE__) . 'ajax-sync.js', array('jquery'), '1.0', true);

    // Passe a URL do AJAX para o script
    wp_localize_script('mpa-ajax-sync', 'mpa_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php')
    ));
}

add_action('wp_enqueue_scripts', 'mpa_enqueue_scripts');

function mpa_get_subscription_info($subscription_id, $token) {
    $url = "https://api.mercadopago.com/preapproval/{$subscription_id}?access_token={$token}";

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        // Log the error
        error_log("Error getting subscription info: " . $response->get_error_message());
        return null;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
	
    // Log the response
    error_log("Subscription info: " . print_r($data, true));
	
    return $data;
}

function mpa_update_subscription_status() {
    error_log("Updating subscription status...");
    $user_id = get_current_user_id();
    $token = get_user_meta($user_id, 'mpa_token', true);
    $subscription_id = get_user_meta($user_id, 'mpa_subscription_id', true);

    if (!empty($token) && !empty($subscription_id)) {
        $subscription_info = mpa_get_subscription_info($subscription_id, $token);

        if (!empty($subscription_info)) {
            $status = $subscription_info['status'];
            update_user_meta($user_id, 'mpa_status', $status);

            // Log the status
            error_log("Subscription status: " . $status);

            // The membership plan ID
            $plan_id = 6570;

            // Get the user's membership
            $membership = wc_memberships_get_user_membership($user_id, $plan_id);

            if ($status == 'authorized') {
                if (!$membership) {
                    // Add the user to the membership plan
                    $membership = wc_memberships_create_user_membership(array(
                        'plan_id' => $plan_id,
                        'user_id' => $user_id,
                    ));

                    // Log the membership creation
                    error_log("Membership created: " . print_r($membership, true));
                }

                // Update the membership's end date
                $next_payment_date = $subscription_info['next_payment_date'];
                $membership->set_end_date($next_payment_date);
            } else if ($status == 'paused' || $status == 'cancelled') {
                if ($membership) {
                    // Pause or cancel the user's membership
                    $membership->update_status($status == 'paused' ? 'paused' : 'cancelled');

                    // Log the membership update
                    error_log("Membership updated: " . $membership->get_id());
                }
            }
        }
    }
}

function mpa_shortcode() {
    ob_start();

    mpa_update_subscription_status();

    return ob_get_clean();
}

add_shortcode('mpa_update_status', 'mpa_shortcode');