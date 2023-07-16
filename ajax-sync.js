jQuery(document).ready(function($) {
    function mpa_sync_subscriptions() {
        // Faça uma solicitação AJAX para sincronizar novamente as assinaturas
        $.ajax({
            url: mpa_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'mpa_sync_subscriptions',
                user_id: mpa_ajax.user_id
            },
            success: function(response) {
                // Manipule a resposta da solicitação AJAX aqui
                // Por exemplo, atualize a tabela de assinaturas com os dados atualizados
            },
            error: function(xhr, status, error) {
                // Manipule erros de solicitação AJAX aqui
            }
        });
    }

    $('.sync-subscriptions').on('click', function(e) {
        e.preventDefault();

        mpa_sync_subscriptions();
    });
});
