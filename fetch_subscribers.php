<?php
// Verifica se o nonce de segurança é válido
if (isset($_POST['fetch_subscribers_nonce']) && wp_verify_nonce($_POST['fetch_subscribers_nonce'], 'fetch_subscribers_action')) {
    // Inclua o arquivo principal do plugin para poder usar as funções
    include_once plugin_dir_path(__FILE__) . 'mp-functions.php';

    // Obtém as credenciais do Mercado Pago
    $mpa_settings = get_option('mpa_settings');
    $mpa_access_token = isset($mpa_settings['mpa_access_token']) ? $mpa_settings['mpa_access_token'] : '';
    $mpa_client_id = isset($mpa_settings['mpa_client_id']) ? $mpa_settings['mpa_client_id'] : '';

    // Verifica se as credenciais estão definidas
    if (!empty($mpa_access_token) && !empty($mpa_client_id)) {
        // Importa a biblioteca do Mercado Pago
        require_once 'vendor/autoload.php';

        // Configura as credenciais do Mercado Pago
        MercadoPago\SDK::setAccessToken($mpa_access_token);
        MercadoPago\SDK::setIntegratorId($mpa_client_id);

        // Realize as ações necessárias para buscar as novas assinaturas e adicioná-las ao banco de dados
        global $wpdb;
        $table_name = $wpdb->prefix . 'mpa_subscribers';

        try {
            // Busca as assinaturas utilizando a API do Mercado Pago
            $subscriptions = MercadoPago\Subscription::search();

            // Percorre as assinaturas retornadas e adiciona ao banco de dados
            foreach ($subscriptions as $subscription) {
                $new_subscription = array(
                    'user_id' => $subscription->user_id,
                    'user_email' => $subscription->email,
                    'user_name' => $subscription->first_name,
                    'user_surname' => $subscription->last_name,
                    'user_status' => $subscription->status,
                    'user_plan' => $subscription->plan->name,
                    'user_plan_status' => $subscription->plan->status,
                    'user_plan_date' => $subscription->start_date,
                );
                $wpdb->insert($table_name, $new_subscription);
            }

            // Redireciona de volta para a página de configurações
            wp_redirect(admin_url('admin.php?page=mp_assinaturas'));
            exit;
        } catch (Exception $e) {
            // Trata o erro caso ocorra algum problema na busca das assinaturas
            wp_die('Erro ao buscar as assinaturas: ' . $e->getMessage());
        }
    } else {
        // Credenciais não definidas, exiba uma mensagem de erro
        wp_die('As credenciais do Mercado Pago não estão configuradas corretamente.');
    }
} else {
    // Nonce inválido, exiba uma mensagem de erro
    wp_die('Nonce de segurança inválido.');
}
