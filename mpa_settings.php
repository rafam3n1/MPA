<?php

// Criar tabela
require_once plugin_dir_path(__FILE__) . 'mp-functions.php'; // Certifique-se de que o caminho para o arquivo mpa-functions.php está correto
register_activation_hook(__FILE__, 'mpa_create_subscribers_table');

// Defina as credenciais do Mercado Pago
$mpa_public_key = 'APP_USR-1f4cf518-8e0e-4d25-b8c9-c026e569ecb6';
$mpa_access_token = 'APP_USR-4002491191110026-062215-112586115bfb3d0002598673b0931972-1035913108';
$mpa_client_id = '4002491191110026';
$mpa_client_secret = 'lw9SkxuFlIDlffFiUdAGhTf5dJmGzMOO';

// Adicione uma nova seção à página de configurações do WordPress
if (!function_exists('mpa_add_admin_menu')) {
    function mpa_add_admin_menu() { 
        add_options_page('MP Assinaturas', 'MP Assinaturas', 'manage_options', 'mp_assinaturas', 'mpa_options_page');
    }
    add_action('admin_menu', 'mpa_add_admin_menu');
}

if (!function_exists('mpa_settings_init')) {
    function mpa_settings_init() { 
        register_setting('pluginPage', 'mpa_settings');

        add_settings_section(
            'mpa_pluginPage_section', 
            __('Configurações do Mercado Pago', 'mpa'), 
            'mpa_settings_section_callback', 
            'pluginPage'
        );

        // Adicione campos para cada uma das suas credenciais
        add_settings_field( 
            'mpa_public_key', 
            __('Public Key', 'mpa'), 
            'mpa_public_key_render', 
            'pluginPage', 
            'mpa_pluginPage_section' 
        );

        add_settings_field( 
            'mpa_access_token', 
            __('Access Token', 'mpa'), 
            'mpa_access_token_render', 
            'pluginPage', 
            'mpa_pluginPage_section' 
        );

        add_settings_field( 
            'mpa_client_id', 
            __('Client ID', 'mpa'), 
            'mpa_client_id_render', 
            'pluginPage', 
            'mpa_pluginPage_section' 
        );

        add_settings_field( 
            'mpa_client_secret', 
            __('Client Secret', 'mpa'), 
            'mpa_client_secret_render', 
            'pluginPage', 
            'mpa_pluginPage_section' 
        );
    }
    add_action('admin_init', 'mpa_settings_init');
}

function mpa_public_key_render() { 
    $mpa_settings = get_option('mpa_settings');
    $mpa_public_key = isset($mpa_settings['mpa_public_key']) ? $mpa_settings['mpa_public_key'] : '';
    ?>
    <input type='text' name='mpa_settings[mpa_public_key]' value='<?php echo $mpa_public_key; ?>'>
    <?php
}

function mpa_access_token_render() { 
    $mpa_settings = get_option('mpa_settings');
    $mpa_access_token = isset($mpa_settings['mpa_access_token']) ? $mpa_settings['mpa_access_token'] : '';
    ?>
    <input type='text' name='mpa_settings[mpa_access_token]' value='<?php echo $mpa_access_token; ?>'>
    <?php
}

function mpa_client_id_render() { 
    $mpa_settings = get_option('mpa_settings');
    $mpa_client_id = isset($mpa_settings['mpa_client_id']) ? $mpa_settings['mpa_client_id'] : '';
    ?>
    <input type='text' name='mpa_settings[mpa_client_id]' value='<?php echo $mpa_client_id; ?>'>
    <?php
}

function mpa_client_secret_render() { 
    $mpa_settings = get_option('mpa_settings');
    $mpa_client_secret = isset($mpa_settings['mpa_client_secret']) ? $mpa_settings['mpa_client_secret'] : '';
    ?>
    <input type='text' name='mpa_settings[mpa_client_secret]' value='<?php echo $mpa_client_secret; ?>'>
    <?php
}

function mpa_settings_section_callback() { 
    echo __('Insira suas credenciais do Mercado Pago abaixo:', 'mpa');
}

function mpa_options_page() { 
    ?>
    <form action='options.php' method='post'>
        <h2>MP Assinaturas</h2>
        <?php
        settings_fields('pluginPage');
        do_settings_sections('pluginPage');
        submit_button();
        ?>
    </form>
    <form action='' method='post'>
        <input type='submit' name='mpa_sync_all' value='Sincronizar Todos'>
    </form>
    <?php
    if (isset($_POST['mpa_sync_all'])) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'mpa_subscribers';
        $subscribers = $wpdb->get_results("SELECT * FROM $table_name");
        foreach ($subscribers as $subscriber) {
            mpa_update_subscription_status($subscriber->user_id);
        }
    }
}
