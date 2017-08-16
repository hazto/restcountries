// using es5 ... never know who's using ie11 ;)

$(function () {
    // suggestion list item template
    var suggestionTemplate = $('#suggestionTemplate').html();
    // cache the suggestion list
    var $suggestionList = $('#suggested');

    // a throttle to avoid pummeling their api with requests...
    var searchTimer;
    // how long to throttle the search request
    var searchDelay = 300;

    var $search = $('#search').on('keyup', function () {
        // reset the timer
        clearTimeout(searchTimer);

        // and set it again
        searchTimer = setTimeout(searchForCountryByName, searchDelay);
    });

    $('body').on('click', '.suggested__suggestion', function () {
        // cache this
        var $self = $(this);
        $self.addClass('selected');

        // hide the unselected items
        $('.suggested__suggestion:not(.selected)').addClass('hidden');

        // get the results template and start populating it
        var template = $('#resultTemplate').html();
        var $result = $(template);
        var country = JSON.parse($self.data('country'));

        populateTemplateText($result.find('.search-result__capital'), country.capital);
        populateTemplateText($result.find('.search-result__population'), country.population);
        populateTemplateText($result.find('.search-result__name'), country.name);

        console.log(country.translations);
        if (!!country.translations) {
            console.log(country.translations)
            var translationTemplate = $('#nameTranslationTemplate').html();

            for (var key in country.translations) {
                var $translation = $(translationTemplate);
                $translation.text(country.translations[key]);
                $result.find('.search-result__name').after($translation);
            }
        }

        if (!!country.flag) {
            $result.find('.search-result__flag').prop('src', country.flag);
        } else {
            $result.find('.search-result__flag').hide();
        }

        $self.append($result);

    });

    function searchForCountryByName() {
        var searchTerm = $search.val();
        repository.getSuggestions(searchTerm).then(showSuggestions, showError);
    }

    function showSuggestions(suggestions) {
        clearSuggestions();

        $.each(suggestions, function (index, suggestion) {
            addSuggestion(suggestion);
        });
    }

    function showError(error) {
        console.error(error);
        addSuggestion({ name: 'No matches found.  Try again?' }, true);
    }

    function addSuggestion(item, clear) {
        if (clear) {
            clearSuggestions();
        }

        if (!!item) {
            // get the suggestion template and create new list item from it
            var $newSuggestion = $(suggestionTemplate);
            $newSuggestion.text(item.name);

            // just embed the data in the element since we're not using mvvm or binding
            $newSuggestion.data('country', JSON.stringify(item));
            $suggestionList.append($newSuggestion);
        }
    }

    function clearSuggestions() {
        $suggestionList.html('');
    }

    function populateTemplateText($templateItem, value) {
        if (!!value) {
            $templateItem.find('.value').text(value);
        } else {
            $templateItem.hide();
        }
    }
});

// encapsulation for interfacing with external resources
// keeps consistent intra-app interface as external interfaces change
// also makes a great testing/mocking abstraction layer
var repository = (function ($) {
    // for building urls to the api
    var baseUrl = 'https://restcountries.eu/rest/v2/';

    // for token replacement 
    var token = '{magic-token}';

    // catalog endpoints and their parameters/tokens
    var endpoints = {
        name: 'name/' + token, //`name/${token}`,
        fullName: 'name/' + token + '?fullText=true&fields=name;capital;population;flag;translations'
    };

    // very simple single-token replacement to form urls
    function tokenizeUrl(value, endpoint) {
        return url = baseUrl + endpoint.replace(token, value);
    }

    function searchCountryNameSuggestions(searchTerm) {
        var promise = $.ajax({
            url: tokenizeUrl(searchTerm, endpoints.name),
            method: 'GET'
        });

        return promise;
    }

    return {
        getSuggestions: searchCountryNameSuggestions
    };

})(jQuery);