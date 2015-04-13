(function() {
  'use strict';

  angular
    .module('jandiApp')
    .config(function($tooltipProvider) {
      $tooltipProvider.options({appendToBody:true});
    })
    .directive('topic', topic)
    .controller('topicCtrl', topicCtrl);

  function topic() {
    return {
      restrict: 'EA',
      require: '^topics',
      scope: true,
      controller: 'topicCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/left/topics/topic/topic.html'
    };

    function link(scope, element, attrs, ctrl) {
    }
  }

  function topicCtrl($scope, $rootScope, $state) {
    // topic title에 mouseenter시 tooltip의 출력 여부 설정하는 function
    // angular ui tooltip에 '' 문자열을 입력하면 tooltip을 출력하지 않음
    $scope.setTooltip = function ( event, joinedEntityName ) {
      var target,
          c;

      target = $( event.target );
      c = target
            .clone()
            .css( {display: 'block', width: 'auto', visibility: 'hidden'} )
            .appendTo(target.parent());

      $scope.tooltip = c.width() <= target.width() ? joinedEntityName : '';
      c.remove();
    };
  }
})();
