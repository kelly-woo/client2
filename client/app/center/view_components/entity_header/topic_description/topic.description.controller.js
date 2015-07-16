/**
 * @fileoverview topic description창의 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function(){
  'use strict';

  angular
    .module('jandiApp')
    .controller('jndTooltipCtrl', jndTooltipCtrl);

  /* @ngInject */
  function jndTooltipCtrl($scope, currentSessionHelper) {

    _setCurrentEntity();

    $scope.$on('onCurrentEntityChanged', _setCurrentEntity);

    function _setCurrentEntity() {
      $scope.currentEntity = currentSessionHelper.getCurrentEntity();
    }
  }
})();
