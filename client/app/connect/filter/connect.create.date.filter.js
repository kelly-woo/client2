/**
 * @fileoverview connect 에서
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('connectCreateDate', connectCreateDate);

  /* @ngInject */
  function connectCreateDate($filter) {
    return function(createdAt) {
      var template = $filter('translate')('@jnd-connect-34');
      var date = $filter('date')(createdAt, 'yyyy-MM-dd');
      return template.replace('{{yyyy-mm-dd}}', date);
    }
  }
})();
