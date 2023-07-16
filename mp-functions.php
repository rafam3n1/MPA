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

require_once plugin_dir_path(__FILE__) . 'mpa-settings.php';
//require_once plugin_dir_path(__FILE__) . 'total-ativos.php';
register_activation_hook(__FILE__, 'mpa_create_subscribers_table');

//ajax do total de assinantes
function mpa_enqueue_ajax_scripts() {
    wp_register_script('mpa-ajax-script', plugins_url('/js/mpa-ajax.js', __FILE__), array('jquery'));
    wp_enqueue_script('mpa-ajax-script');
    wp_localize_script('mpa-ajax-script', 'mpa_ajax_object', array('ajax_url' => admin_url('admin-ajax.php')));
}
add_action('wp_enqueue_scripts', 'mpa_enqueue_ajax_scripts');


// Criar Tabela caso nao exista
function mpa_create_subscribers_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'mpa_subscribers';

    // Verifique se a tabela já existe
    if($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        // Código SQL para criar a tabela
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            user_email VARCHAR(100) NOT NULL,
            user_name VARCHAR(100) NOT NULL,
            user_surname VARCHAR(100) NOT NULL,
            user_status VARCHAR(50) NOT NULL,
            user_plan VARCHAR(50) NOT NULL,
            user_plan_status VARCHAR(50) NOT NULL,
            user_plan_date datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
            subscription_id VARCHAR(50) NOT NULL,
            PRIMARY KEY  (id)
        );";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Defina o nome da tabela
global $wpdb;
$table_name = $wpdb->prefix . 'mpa_subscribers';



// Função para inserir ou atualizar dados no banco de dados
function mpa_insert_into_db($user_id, $subscription_info) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'mpa_subscribers';


    if ($subscription_already_linked) {
        error_log('[30-Jun-2023 22:18:31 UTC] Assinatura já vinculada a outra conta.');
        return new WP_Error('subscription_already_linked', 'Assinatura já vinculada a outra conta.');
    }

    // Log para verificar se a função foi chamada
    error_log("mpa_insert_into_db chamado");

    // Log para verificar os dados da assinatura
    error_log("Dados de assinatura: " . print_r($subscription_info, true));

    // Obtenha os dados do usuário do WordPress
    $user_data = get_userdata($user_id);

    // Verifique se os dados do usuário foram recuperados corretamente
    $user_email = $user_data ? $user_data->user_email : '';
    $user_name = $user_data ? $user_data->user_login : '';

    // Verifique se a assinatura já está vinculada a outra conta
    $subscription_id = $subscription_info['id'];
    $existing_subscription = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $table_name WHERE subscription_id = %s AND user_id != %d",
            $subscription_id,
            $user_id
        )
    );

if ($existing_subscription) {
    // A assinatura já está vinculada a outra conta, retorne uma mensagem de erro
    // Log para verificar se a assinatura já está vinculada a outra conta
    error_log("Assinatura já vinculada a outra conta.");
    return new WP_Error('subscription_already_linked', 'Assinatura já vinculada a outra conta.');
}


    $data = array(
        'user_id' => $user_id,
        'user_email' => $user_email, // Use o e-mail do usuário do WordPress
        'user_name' => $user_name, // Use o nome de usuário do WordPress
        'user_surname' => '',
        'user_status' => isset($subscription_info['payer_status']) ? $subscription_info['payer_status'] : '',
        'user_plan' => isset($subscription_info['plan_id']) ? $subscription_info['plan_id'] : '',
        'user_plan_status' => isset($subscription_info['status']) ? $subscription_info['status'] : '',
        'user_plan_date' => isset($subscription_info['date_created']) ? $subscription_info['date_created'] : '',
        'subscription_id' => $subscription_id
    );

    // Verifique se o usuário já está na tabela
    $existing_user = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d",
            $user_id
        )
    );

    if ($existing_user) {
        // O usuário já está na tabela, atualize seus dados
        $result = $wpdb->update(
            $table_name,
            $data,
            array('user_id' => $user_id)
        );
    } else {
        // O usuário não está na tabela, insira seus dados
        $result = $wpdb->insert(
            $table_name,
            $data
        );
    }

    // Log para verificar o resultado da consulta SQL
    error_log("Resultado da consulta SQL: " . $result);

    // Verifique se a operação foi bem-sucedida
    if ($result === false) {
         // A operação falhou, lance uma exceção
         // Log para verificar se a exceção foi lançada
                  error_log("Erro ao atualizar as informações da assinatura.");
         throw new Exception("Erro ao atualizar as informações da assinatura.");
    }

    // A operação foi bem-sucedida, retorne verdadeiro
    // Log para verificar se a operação foi bem-sucedida
    error_log("Atualização das informações da assinatura bem-sucedida.");
    return true;
}


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

    // Se o subscription_id for nulo, atribua 'erro' a ele e continue
    if (empty($subscription_id)) {
        error_log("subscription_id é nulo. Atribuindo 'erro' a ele e continuando...");
        $subscription_id = 'erro';
    }
    
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

                try {
                    mpa_insert_into_db($user_id, $subscription_info);
                } catch (Exception $e) {
                    error_log("Erro ao inserir ou atualizar os dados da assinatura: " . $e->getMessage());
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

            try {
                // Insert the subscription info into the database
                $result = mpa_insert_into_db($user_id, $subscription_info);
            
                if (is_wp_error($result)) {
                    // $result é um erro, registre a mensagem de erro e interrompa a execução do código
                    error_log('Erro: ' . $result->get_error_message());
                    return;
                }
            } catch (Exception $e) {
                error_log("Erro ao inserir ou atualizar os dados da assinatura: " . $e->getMessage());
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

add_action('wc_memberships_user_membership_saved', function($user_membership) {
    // Limpe todos os cookies
    foreach ($_COOKIE as $key => $value) {
        unset($_COOKIE[$key]);
        setcookie($key, '', time() - 3600, '/'); // tempo no passado
    }
});

//username aparecendo na header
function add_custom_js() {
    $current_user = wp_get_current_user();
    if ( $current_user->exists() ) {
        ?>
        <script>
        document.addEventListener("DOMContentLoaded", function() {
            var accountElement = document.querySelector('#conta .elementor-icon-list-text');
            if (accountElement) {
                accountElement.textContent = '<?php echo $current_user->user_login; ?>';
            }
        });
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_custom_js');

//SHORTCODE [conteudo-minha-conta]
function minha_conta_content_shortcode($atts) {
    // Certifique-se de que o usuário está logado
    if (is_user_logged_in()) {
        // Obtenha o usuário atual
        $current_user = wp_get_current_user();
        $first_name = $current_user->user_firstname;

        // Personalize o conteúdo
        $content = "<p>&nbsp;</p><table><tr><td><b>Bem-Vindo</b> ao <b>Grupo Bright!</b></</td></tr></table><p> Aqui você pode ver, gerenciar e sincronizar sua assinatura, agora trabalhamos com as Assinaturas do Mercado Pago, você precisa ter uma conta no Mercado Pago, fazer sua compra, depois você acessa e sincroniza.</p>
        <p>Depois basta clicar em PLAY e começar sua experiência!</p>
        <p>A Aba de Tickets serve apenas para tickets de reembolso, tickets sobre outros assuntos você deve abrir no <a href='https://discord.com/invite/CuCJ9XckC3' target='_blank'>Discord</a>, <a href='https://api.whatsapp.com/send/?phone=5511966714802&text&type=phone_number&app_absent=0' target='_blank'>Whatsapp</a> ou usar nossa Inteligência artificial.</p>
        <p>O modo anterior de assinaturas ainda segue funcionando mas foi cortada as renovações, agora trabalhamos apenas com o novo modo do Mercado Pago.
        <p>
            <a href='/minha-conta/mpa_subscription/' target='_blank'><button style='cursor:pointer;'>MP Assinaturas</button></a>
            <a href='/comprar/bright-beta/' target='_blank'><button style='cursor:pointer;'>Comprar</button></a>
            <a href='/jogar' target='_blank'><button style='cursor:pointer;'>PLAY</button></a>
        </p>";

        return $content;
    } else {
        return 'Você precisa estar logado para ver esta página.';
    }
}
add_shortcode('conteudo-minha-conta', 'minha_conta_content_shortcode');


