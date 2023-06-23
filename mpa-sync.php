<?php
require_once('wp-load.php');

// Defina as credenciais do Mercado Pago
$mpa_client_id = '4002491191110026';
$mpa_client_secret = 'lw9SkxuFlIDlffFiUdAGhTf5dJmGzMOO';

// Inicie a autenticação OAuth com o Mercado Pago
function mpa_sync() {
    global $mpa_client_id, $mpa_client_secret;

    // Construa a URL de autenticação OAuth
    $auth_url = "https://auth.mercadopago.com.br/authorization?client_id={$mpa_client_id}&response_type=code&platform_id=mp&redirect_uri=" . urlencode(site_url('/mp_received.php'));

    // Redirecione o usuário para a URL de autenticação OAuth
    wp_redirect($auth_url);
    exit;
}

// Registre a ação AJAX para a função mpa_sync
add_action('wp_ajax_mpa_sync', 'mpa_sync');
add_action('wp_ajax_nopriv_mpa_sync', 'mpa_sync');
