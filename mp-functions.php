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
        <tr>
    <th>
        <label for="mpa_plan_name"><?php _e('Nome do Plano', 'mpa'); ?></label>
    </th>
    <td>
        <input type="text" name="mpa_plan_name" id="mpa_plan_name" value="<?php echo esc_attr(get_the_author_meta('mpa_plan_name', $user->ID)); ?>" class="regular-text" /><br />
        <span class="description"><?php _e('Por favor insira o nome do plano.', 'mpa'); ?></span>
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
    update_user_meta($user_id, 'mpa_plan_name', $_POST['mpa_plan_name']);

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
    error_log("Atualizando status da assinatura...");
    $user_id = get_current_user_id();
    $token = get_user_meta($user_id, 'mpa_token', true);
    $subscription_id = get_user_meta($user_id, 'mpa_subscription_id', true);
    
    if (!empty($token) && !empty($subscription_id)) {
        $subscription_info = mpa_get_subscription_info($subscription_id, $token);
        error_log("Informações da assinatura: " . print_r($subscription_info, true));

        if (!empty($subscription_info)) {
            $status = $subscription_info['status'];
            update_user_meta($user_id, 'mpa_status', $status);
            
            // Atualize o nome do plano aqui
            $plan_name = $subscription_info['reason'];
        update_user_meta($user_id, 'mpa_plan_name', $plan_name);
        error_log("Nome do plano atualizado: " . get_user_meta($user_id, 'mpa_plan_name', true));

            // Log the status
            error_log("Status da assinatura: " . $status);

            // The membership plan ID
            $plan_id = 9512;

            // Get the user's membership
            $membership = wc_memberships_get_user_membership($user_id, $plan_id);

            if ($membership) {
                error_log("Associação encontrada: " . print_r($membership, true));
            } else {
                error_log("Nenhuma associação encontrada para o usuário: " . $user_id);
            }

            if ($status == 'authorized') {
                if (!$membership) {
                    // Add the user to the membership plan
                    $membership = wc_memberships_create_user_membership(array(
                        'plan_id' => $plan_id,
                        'user_id' => $user_id,
                    ));

                    // Check for errors
                    if (is_wp_error($membership)) {
                        error_log('Error creating membership: ' . $membership->get_error_message());
                    } else {
                        // Log the membership creation
                        error_log("Associação criada: " . print_r($membership, true));
                    }
                } else {
                    // If the membership is not active, activate it
                    if ($membership->get_status() != 'active') {
                        $membership->update_status('active');
                        error_log("Associação ativada: " . $membership->get_id());
                    }
                }

                // Update the membership's end date
                $next_payment_date = $subscription_info['next_payment_date'];
                $membership->set_end_date($next_payment_date);
                error_log("Data de término da associação atualizada: " . $next_payment_date);
            } else if ($status == 'paused' || $status == 'cancelled') {
    if ($membership) {
        // Pause or cancel the user's membership
        $result = $membership->update_status($status == 'paused' ? 'cancelled' : 'cancelled');

        // Log the membership update
        error_log("Associação atualizada: " . $membership->get_id() . ", resultado: " . ($result ? 'sucesso' : 'falha'));
    }
}

        } else {
            error_log("Não foi possível obter informações da assinatura para o usuário: " . $user_id);
        }
    } else {
        error_log("Token ou ID de assinatura não fornecidos para o usuário: " . $user_id);
    }
}



function mpa_shortcode() {
    ob_start();

    mpa_update_subscription_status();

    return ob_get_clean();
}

add_shortcode('mpa_update_status', 'mpa_shortcode');
?>