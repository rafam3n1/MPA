<?php

// Adicione o endpoint ao conjunto de URLs do WordPress
function mpa_add_endpoint() {
    add_rewrite_endpoint('mpa_subscription', EP_ROOT | EP_PAGES);
}

add_action('init', 'mpa_add_endpoint');

// Adicione o novo item ao menu da conta do WooCommerce
function mpa_add_account_menu_item($items) {
    $items['mpa_subscription'] = __('Assinatura do Mercado Pago', 'mpa');
    return $items;
}

add_filter('woocommerce_account_menu_items', 'mpa_add_account_menu_item');

// Exiba o conteúdo do endpoint
function mpa_endpoint_content() {
    $user_id = get_current_user_id();
    $token = get_user_meta($user_id, 'mpa_token', true);
    $subscription_id = get_user_meta($user_id, 'mpa_subscription_id', true);
    $plan_name = get_user_meta($user_id, 'mpa_plan_name', true);

if (empty($token)) {
    echo '<table><tr><td>';
	echo __('Você ainda não sincronizou sua conta do Mercado Pago', 'mpa');
	echo '</td></tr></table>';
    echo '<p>' . __('Clique em sincronizar para vincular sua conta.', 'mpa') . '</p>';
    echo '<button onclick="window.location.href=\'https://auth.mercadopago.com.br/authorization?client_id=4002491191110026&response_type=code&platform_id=mp&redirect_uri=' . $redirect_uri . '\'" style="margin-right: 2px;">' . __('Sincronizar', 'mpa') . '</button>';
}  {
    echo '<table>';


        $subscription_info = mpa_get_subscription_info($subscription_id, $token);

        if (!empty($subscription_info)) {
            $translated_fields = array(
                'id' => __('ID', 'mpa'),
                'payer_id' => __('Payer ID', 'mpa'),
                'reason' => __('Plano', 'mpa'),
                'date_created' => __('Data de criação', 'mpa'),
                'next_payment_date' => __('Data do Próximo Pagamento', 'mpa')
            );

            // Traduza o status
            $translated_fields['status'] = __('Status', 'mpa');
            $status = $subscription_info['status'];
            $status_translation = '';

            switch ($status) {
                case 'pending':
                    $status_translation = __('Pendente', 'mpa');
                    break;
                case 'authorized':
                    $status_translation = __('Ativo', 'mpa');
                    break;
                case 'paused':
                    $status_translation = __('Pausado', 'mpa');
                    break;
                case 'cancelled':
                    $status_translation = __('Cancelado', 'mpa');
                    break;
            }

            $subscription_info['status'] = esc_html($status_translation);

            // Formate a data
            $date_created = date_create_from_format('Y-m-d\TH:i:s.uP', $subscription_info['date_created']);
            $subscription_info['date_created'] = $date_created->format('d/m/Y H:i') . 'h';

            $next_payment_date = date_create_from_format('Y-m-d\TH:i:s.uP', $subscription_info['next_payment_date']);
            $subscription_info['next_payment_date'] = $next_payment_date->format('d/m/Y H:i') . 'h';

            foreach ($subscription_info as $key => $value) {
                if (isset($translated_fields[$key])) {
                    echo '<tr>';
                    echo '<th>' . esc_html($translated_fields[$key]) . '</th>';
                    echo '<td>' . esc_html($value) . '</td>';
                    echo '</tr>';
                }
            }

			// Botões para acessar as assinaturas no Mercado Pago e a ação do seu novo botão

			echo '<button onclick="window.open(\'https://www.mercadopago.com.br/subscriptions\', \'_blank\')" style="margin-right: 5px; padding: 15px 10px; background-color: #007bff; color: #fff; border: none; cursor: pointer;">' . __('Ver Assinaturas do MP', 'mpa') . '</button>';
			echo '<button onclick="window.location.href=\'https://auth.mercadopago.com.br/authorization?client_id=4002491191110026&response_type=code&platform_id=mp&redirect_uri=' . $redirect_uri . '\'" style="margin-right: 2px;">' . __('Re-sincronizar', 'mpa') . '</button>';
			echo '<br>';
			echo '</br>';				


        }

        echo '</table>';
    }
}

add_action('woocommerce_account_mpa_subscription_endpoint', 'mpa_endpoint_content');

?>