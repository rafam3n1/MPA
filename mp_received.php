<?php
require_once('wp-load.php');

$code = $_GET['code'];

// Obtenha as credenciais do Mercado Pago
$client_id = '4002491191110026';
$client_secret = 'lw9SkxuFlIDlffFiUdAGhTf5dJmGzMOO';

// Faça uma solicitação POST para obter o token de acesso
$response = wp_remote_post('https://api.mercadopago.com/oauth/token', array(
    'body' => array(
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'grant_type' => 'authorization_code',
        'code' => $code,
        'redirect_uri' => 'https://grupobright.com/mp_received.php'
    )
));

// Log the response
error_log(print_r($response, true));

if (is_wp_error($response)) {
    // Trate o erro aqui...
    echo 'Erro ao obter o token de acesso: ' . $response->get_error_message();
    exit;
}

$body = wp_remote_retrieve_body($response);
$data = json_decode($body, true);

if (!isset($data['access_token']) || !isset($data['user_id'])) {
    echo 'Não foi possível obter o token de acesso ou o ID do usuário.';
    exit;
}

$token = $data['access_token'];
$user_id = $data['user_id'];

// Obtenha o ID do usuário do WordPress
$wp_user_id = get_current_user_id();

// Salve o token de acesso e o ID do usuário do Mercado Pago no perfil do usuário do WordPress
update_user_meta($wp_user_id, 'mpa_token', $token);
update_user_meta($wp_user_id, 'mpa_user_id', $user_id);

// Faça uma solicitação GET para buscar o ID da assinatura
$url = "https://api.mercadopago.com/preapproval/search?access_token={$token}&status=authorized";

$response = wp_remote_get($url);

if (is_wp_error($response)) {
    // Trate o erro aqui...
    echo 'Erro ao buscar o ID da assinatura: ' . $response->get_error_message();
    exit;
}

$body = wp_remote_retrieve_body($response);
$data = json_decode($body, true);

if (!empty($data['results'])) {
    $subscription_id = $data['results'][0]['id'];

    // Salve o ID da assinatura no perfil do usuário
    update_user_meta($wp_user_id, 'mpa_subscription_id', $subscription_id);
}

// Obtenha o status da assinatura
$status = isset($data['results'][0]['status']) ? $data['results'][0]['status'] : '';

// Salve o status no perfil do usuário
update_user_meta($wp_user_id, 'mpa_status', $status);

// Redirecione o usuário de volta para a página da conta
try {
    header("Location: " . wc_get_account_endpoint_url('mpa_subscription'));
} catch (Exception $e) {
    echo 'Exceção capturada: ',  $e->getMessage(), "\n";
}
exit;