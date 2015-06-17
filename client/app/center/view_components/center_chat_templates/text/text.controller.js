/**
 * @fileoverview 센터페널 메세지중 단순 텍스트일때만 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TextMessageCtrl', TextMessageCtrl);

  /* @ngInject */
  function TextMessageCtrl($scope) {
    // 현재 text 전체를 감싸고 있는 엘레멘트
    var jqTextContainer = $(document.getElementById($scope.msg.id));

    $scope.onTrashCanMouseEnter = onTrashCanMouseEnter;
    $scope.onTrashCanMouseLeave = onTrashCanMouseLeave;

    /**
     * 삭제하기 버튼에 마우스가 들어왔을 때
     */
    function onTrashCanMouseEnter() {
      jqTextContainer.addClass('text-delete-background');
    }

    /**
     * 삭제하기 버튼에 마우스가 나갔을 때
     */
    function onTrashCanMouseLeave() {
      jqTextContainer.removeClass('text-delete-background');
    }
  }
})();
