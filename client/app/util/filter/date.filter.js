/**
 * @fileoverview center에서 사용되어지는 data divider의 L10N을 위한 필터
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('getDate', getDate);

  /* @ngInject */
  function getDate(DateFormatter) {
    return function(input) {
      return _getLocalizedDateFormat(input);
    }
  }


  function _getLocalizedDateFormat(input) {
    console.log(input);

  }
})();
