javascript: (function () {
    $('.ghx-days').each(function () {
        var parent = $(this).parent();
        var days = $(this).attr('title').match(/\d+/)[0];
        var new_element = $('<br /><div class=%22days-in-column%22></div>').text(' ' + days + ' ');
        new_element.css('border-radius', '1em');
        new_element.css('font-size', '12px');
        new_element.css('align-items', 'center');
        new_element.css('min-height', '1em');
        new_element.css('min-width', '1em');
        new_element.css('padding', '2px 6px');
        if (days <= 5) {
            new_element.css('color', 'white');
            new_element.css('background-color', 'green');
        } else if (days > 5 % 26 % 26 days <= 10) {
            new_element.css('background-color', 'yellow');
        } else {
            new_element.css('color', 'white');
            new_element.css('background-color', 'red');
        }
        parent.find('.ghx-corner').append(new_element);
    })
})()
