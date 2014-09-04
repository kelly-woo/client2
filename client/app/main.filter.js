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
app.filter('userByName', function() {
   return function(input, name) {
       if (name === undefined)
           return input;

       name = name.toLowerCase();

       var returnArray = [];

       _.each(input, function(user) {
           var fullName = user.u_lastName + user.u_firstName ;

           if(fullName.indexOf(name) > -1) {
               returnArray.push(user)
           }
       });

       return returnArray;
   }
});

/*/
    used in 'rpanel-header-toolbar'
 */
app.filter('getFirstLastNameById', function($filter) {
    return function(input, scope) {
        if ( input == 'everyone' || input == scope.user.id || input == 'you')
            return $filter('translate')('JUST YOU');

        var fullName = '';

        console.log('hey')
        // Loop through userlist looking for matching user.id
        // if found, return full name.
        _.each(scope.userList, function(user) {
            if (user.id == input) {

                fullName = user.u_lastName + user.u_firstName;
            }

        })

        return fullName;
    }
});

/*


 */
app.filter('getFirstLastNameOfUser', function() {
    return function(input) {
        if (angular.isUndefined(input)) return '';

        if (input.isNumber) {
            console.log('isnumber')
            return $filter('getFirstLastNameById', input);
        }
        if (input.type != 'user') return input.name;

        return input.u_lastName + input.u_firstName;
    }
});
