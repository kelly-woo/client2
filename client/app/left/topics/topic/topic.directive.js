(function() {
  'use strict';

  angular
    .module('jandiApp')
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

    function link(scope, el, attrs, ctrl) {}
  }

  function topicCtrl($scope, $timeout) {
    // topic title에 mouseenter시 tooltip의 출력 여부 설정하는 function
    // angular ui tooltip에 '' 문자열을 입력하면 tooltip을 출력하지 않음
    $scope.onTooltipShow = function(event, joinedEntityName ) {
      var target;
      var c;

      $scope.tooltip = joinedEntityName;

      target = $( event.target );
      c = target
            .clone()
            .css( {display: 'block', width: 'auto', visibility: 'hidden'} )
            .appendTo(target.parent());

      if (c.width() <= target.width()) {
        $scope.tooltip = joinedEntityName;
        $timeout(function() {
          target.trigger('show');
        });
      } else {
        $scope.tooltip = '';
      }

      c.remove();
    };

    $scope.onTooltipHide = function(event) {
      $scope.tooltip = '';
      $timeout(function() {
        $(event.target).trigger('hide');
      });
    };
  }
})();
