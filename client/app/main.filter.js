'use strict';

var app = angular.module('jandiApp');

/*
 *  @filter     : date formatting especially append ordinal suffix of day
 *  @usage      : "oo"
 *  @example    : doo, ddoo
 */
app.filter('ordinalDate', function($filter) {
    var suffixes = ["th", "st", "nd", "rd"];
    return function(input, format) {
        if (isNaN(input)) return false;
        var dtfilter = $filter('date')(input, format);
        var day = parseInt($filter('date')(input, 'dd'));
        var relevantDigits = (day < 30) ? day % 20 : day % 30;
        var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
        return dtfilter.replace('oo', suffix);
    };
});

/*
 *  @filter     : byte formatting
 */
app.filter('bytes', function() {
    return function(bytes, precision) {
        if (bytes === 0) return '0 bytes';
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 0;
        var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + units[number];
    }
});

app.filter('parseUrl', function() {
    //URLs starting with http://, https://, or ftp://
    //var urls = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    var urls = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    var uris = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    //Change email addresses to mailto:: links.
    var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;

    return function(text) {
        text = text.replace(urls, "<a href=\"$1\" target=\"_blank\">$1</a>");

        text = text.replace(uris, "$1<a href=\"http://$2\" target=\"_blank\">$2</a>");

        text = text.replace(emails, "<a href=\"mailto:$1\">$1</a>");

        return decodeURI(text);
    };

});

/*
 used in 'inviteFromChannelModal.tpl.html'
 */
app.filter('userByName', ['$rootScope', function($rootScope) {
    return function(input, name) {
        if (name === undefined)
            return input;

        name = name.toLowerCase();

        var returnArray = [];

        _.each(input, function(user) {
            var fullName = user.u_lastName + user.u_firstName ;

            if ($rootScope.displayNickname) {
                fullName = user.u_nicname;
            }

            if(fullName.indexOf(name) > -1) {
                returnArray.push(user)
            }
        });

        return returnArray;
    }
}
]);

/*/
 used in 'rpanel-header-toolbar'
 */
app.filter('getFirstLastNameById', ['userAPIservice', '$rootScope', '$filter',
    function(userAPIservice, $rootScope, $filter) {
        return function(input) {
            if ( input === 'everyone' || input === $rootScope.user.id || input === 'mine' || input === 'all')
                return $filter('translate')('YOU');

            return userAPIservice.getNameFromUserId(input);
        }
    }
]);

/*


 */
app.filter('getFirstLastNameOfUser', ['userAPIservice',
    function(userAPIservice) {
        return function(input) {
            if (angular.isUndefined(input)) return '';

            if (input.isNumber) {
                console.log('isnumber')
                return $filter('getFirstLastNameById', input);
            }
            if (input.type != 'user') return input.name;

            return userAPIservice.getNameFromUser(input);
        }
    }
]);


app.filter('upperFirstCharacter', function() {
    return function(input) {
        if (angular.isUndefined(input) || input.isNumber ) return input;
        if (input === 'pdf') return 'PDF';

        var newChar = input.charAt(0).toUpperCase() + input.slice(1, input.length);

        return newChar;
    }
});

/*/
 used in 'rpanel-header-toolbar'
 */
app.filter('getNameInFileResult', ['userAPIservice', '$rootScope',
    function(userAPIservice, $rootScope) {
        return function(input) {
            if ( input === 'all') return input;
            if ( input === $rootScope.user.id || input === 'mine' ) return 'you';

            return userAPIservice.getNameFromUserId(input);
        }
    }
]);


