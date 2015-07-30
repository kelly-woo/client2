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
  function jndTooltipCtrl($scope, $filter) {

    _setCurrentEntity();

    $scope.$on('onCurrentEntityChanged', _setCurrentEntity);
    $scope.$on('topicUpdated', function(event, topic) {
        if (topic.id === $scope.currentEntity.id) {
          _setCurrentEntity();
        }
    });

    function _setCurrentEntity() {
      if (!!$scope.currentEntity.description) {
        $scope.topicDescription = $scope.currentEntity.description;
      } else {
        $scope.topicDescription = $filter('translate')('@no-topic-description');
      }
    }
  }
})();
