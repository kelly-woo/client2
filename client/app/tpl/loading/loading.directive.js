(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndLoading', jndLoading);

  /* @ngInject */
  function jndLoading() {
    return {
      restrict: 'E',
      templateUrl: 'app/tpl/loading/loading.tpl.html',
      controller: 'LoadingCtrl',
      scope: {}
    }
  }
})();
