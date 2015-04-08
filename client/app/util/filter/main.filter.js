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

// Url, Email 식별 정규식
// http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/5.0.2_r1/android/util/Patterns.java
// 참조함
app.filter('parseAnchor', function() {
  var DEFAULT_PROTO,
      GOOD_IRI_CHAR,
      IRI,
      GOOD_GTLD_CHAR,
      GTLD,
      HOST_NAME,
      IP_ADDRESS,
      DOMAIN_NAME,
      rWebUrl,
      rEmailAddr,
      rSplit,
      escapeMap;

  DEFAULT_PROTO = 'http://';

  GOOD_IRI_CHAR = 'a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF';
  IRI = '[' + GOOD_IRI_CHAR + ']([' + GOOD_IRI_CHAR + '\\-]{0,61}[' + GOOD_IRI_CHAR + ']){0,1}';
  GOOD_GTLD_CHAR = 'a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF';
  GTLD = '[' + GOOD_GTLD_CHAR + ']{2,63}';
  HOST_NAME = '(' + IRI + '\\.)+' + GTLD;
  IP_ADDRESS = '((25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9]))';
  DOMAIN_NAME = '(' + HOST_NAME + '|' + IP_ADDRESS + ')';

  rWebUrl = new RegExp(
    '((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\\'\\(\\)' +
    '\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_' +
    '\\.\\+\\!\\*\\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?' +
    '(?:' + DOMAIN_NAME + ')' +
    '(?:\\:\\d{1,5})?)' +                                               // plus option port number
    '(\\/(?:(?:[' + GOOD_IRI_CHAR + '\\;\\/\\?\\:\\@\\&\\=\\#\\~' +     // plus option query params
    '\\-\\.\\+\\!\\*\\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?' +
    "(?:\\b|$)"
  );
  rEmailAddr = new RegExp(
    '[a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}' +
    '\\@' +
    '[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}' +
    '(' +
    '\\.' +
    '[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}' +
    ')+'
  );
  rSplit = /\s/;

  escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  };
  function escape( str ) {
    return str.replace(/[&<>'"]/g, function( $1 ) {
      return escapeMap[ $1 ];
    });
  }

  function decodeUri( str ) {
    try {
      str = decodeURI( str );
    } catch( err ) {}

    return str;
  }

  function parse( str, begin, length, fn  ) {
    return escape( str.substring( 0, begin ) ) + fn() + escape( str.substring( begin + length ) );
  }

  return function( text ) {
    var strs,
        matchs;

    strs = text.split( rSplit );
    _.forEach( strs, function( str, index, strs ) {
      if ( str === '' ) {
        strs[ index ] = '\r\n';
      } else {
        if ( matchs = rEmailAddr.exec( str ) ) {      // email
          // console.log('Email ::: ', matchs );
          strs[ index ] = parse( str, str.indexOf( matchs[ 0 ] ), matchs[ 0 ].length, function () {
            return decodeUri( '<a href="mailto:' + matchs[ 0 ] + '">' + matchs[ 0 ] + '</a>' );
          });
        } else if ( matchs = rWebUrl.exec( str ) ) {  // Uri, Url
          // console.log('Uri, Url ::: ', matchs );
          strs[ index ] = parse( str, str.indexOf( matchs[ 0 ] ), matchs[ 0 ].length, function () {
            return decodeUri( '<a href="' + ( matchs[ 2 ] ? '' : DEFAULT_PROTO ) + matchs[ 0 ] + '" target="_blank">' + matchs[ 0 ] + '</a>' );
          });
        } else {
            strs[ index ] = escape( str );
        }
      }
    });

    // console.log( strs.join(" ") );
    return strs.join(" ");
  };
});

// tobe no longer used
app.filter('parseUrl', function() {
  //URLs starting with http://, https://, or ftp://
  //var urls = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  var urls = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  var uris = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  //Change email addresses to mailto:: links.
  // var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  // ref : http://blog.trojanhunter.com/2012/09/26/the-best-regex-to-validate-an-email-address/
  var emails = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/gim;

  return function(text) {

    // fix : JND-846
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    var urlStrs = text.match(urls);
    _.forEach(urlStrs, function(urlStr) {
      var tempUrlStr = '<a href="' + urlStr + '" target="_blank">' + urlStr + '</a>';
      try {
        tempUrlStr = decodeURI(tempUrlStr);
      }
      catch(err) {
//                console.error(err);
      }
      text = text.replace(urlStr, tempUrlStr);
    });

    var uriStrs = text.match(uris);
    _.forEach(uriStrs, function(uriStr) {
      // if <slide ..>www.tosslab.com, uriStr value is ;www.tosslab.com. so remove ; in uriStr
      uriStr = uriStr.substring(uriStr.indexOf('www'));
      var tempUriStr = '<a href="http://' + uriStr + '" target="_blank">' + uriStr + '</a>';
      try {
        tempUriStr = decodeURI(tempUriStr);
      }
      catch(err) {
//                console.error(err);
      }
      text = text.replace(uriStr, tempUriStr);
    });



    var emailStrs = text.match(emails);
    _.forEach(emailStrs, function(emailStr) {
      var tempEmailStr = '<a href="mailto:' + emailStr + '">' + emailStr + '</a>';
      try {
        tempEmailStr = decodeURI(tempEmailStr);
      }
      catch(err) {
//                console.error(err);
      }
      text = text.replace(emailStr, tempEmailStr);
    });

    return text;
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

    _.each(input, function(member) {
      var fullName = member.name.toLowerCase();

      if(fullName.indexOf(name) > -1) {
        returnArray.push(member)
      }
    });

    return returnArray;
  }
}
]);

app.filter('getName', ['memberService',
  function(memberService) {
    return function(input) {
      if (angular.isUndefined(input)) return '';

      if (angular.isNumber(input))
        return memberService.getNameById(input);

      if (input.type != 'user') return input.name;

      return memberService.getName(input);
    }
  }
]);

app.filter('getUserStatusMessage', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getStatusMessage(member);
    }
  }
]);

app.filter('getUserDepartment', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getDepartment(member);
    }
  }
]);

app.filter('getUserPosition', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getPosition(member);
    }
  }
]);

app.filter('getUserPhoneNumber', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getPhoneNumber(member);
    }
  }
]);

app.filter('getUserEmail', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getEmail(member);
    }
  }
]);

app.filter('getSmallThumbnail', ['memberService', 'config',
  function(memberService, config) {
    return function(member) {
      return config.server_uploaded + memberService.getSmallThumbnailUrl(member);
    }
  }
]);
app.filter('getMediumThumbnail', ['memberService', 'config',
  function(memberService, config) {
    return function(member) {
      return config.server_uploaded + memberService.getMediumThumbnailUrl(member);
    }
  }
]);
app.filter('getlargeThumbnail', ['memberService', 'config',
  function(memberService, config) {
    return function(member) {
      return config.server_uploaded + memberService.getLargeThumbnailUrl(member);
    }
  }
]);


/*

 */
/*
 used in file type dropdown.
 */
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

/**
 *
 */

app.filter('getMixPanelFormat', function() {
  return function(input) {
    input = input.toLowerCase();

    // replacing all space with '_'.
    input = input.replace(/ /g, "_");
    return input;
  }
});

app.filter('isDisabledMember', function() {
  return function(member) {
    return member.status == 'disabled';
  }
});


app.filter('getMemberList', function() {
  return function(members, status) {
    console.log(status)
    var enabledMembers = [];
    _.each(members, function(member) {
      if (member.status == status)
        enabledMembers.push(member);
    });

    return enabledMembers;
  };
});
