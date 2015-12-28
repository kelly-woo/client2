/**
 * @fileoverview camelCase 를 dot separator 로 변경한다
 * @example
 $filter('camelToDot')('googleCalendar');
 => google.calendar
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('camelToDot', camelToDot);

  function camelToDot() {
    return function(camelText) {
      camelText = camelText || '';
      return camelText.replace(/[A-Z]/g, function(upperCase) {
        return '.' + upperCase.toLowerCase();
      });
    };
  }
})();
