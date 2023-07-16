jQuery(document).ready(function($) {
    $.ajax({
        url: mpa_ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'mpa_get_total_subscribers'
        },
        success: function(response) {
            $('#wp-admin-bar-top-secondary').prepend('<li id="mpa_total_subscribers">' + response + '</li>');
        }
    });
});
