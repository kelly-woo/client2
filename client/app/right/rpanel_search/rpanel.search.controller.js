/**
 * @fileoverview right panel 상단에 위치한 search input box의 controller 이다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelSearchCtrl', rPanelSearchCtrl);

  /* @ngInject */
  function rPanelSearchCtrl($scope, jndPubSub) {

    /**
     * search box 안에 값이 입력이 되고 사용자가 enter 를 눌렀을 경우 실행된다.
     * 현재 가지고 있는 keyword 와 함게 이벤트를 broadcast 한다.
     */
    $scope.onFileTitleQueryEnter = function() {
      jndPubSub.pub('onrPanelFileTitleQueryChanged', $scope.keyword);
    };

    /**
     * 외부에서 'resetRPnaelSearchStatusKeyword' 라는 이벤트를 날리면 현재 하지고 있는 keyword value 를 reset 한다.
     */
    $scope.$on('resetRPanelSearchStatusKeyword', function() {
      _resetKeyword();
    });

    /**
     * search box 에 focus 를 준다.
     */
    $scope.$on('rPanelSearchFocus', function() {
      _setFocus();
    });

    /**
     * 현재 가지고 있는 keyword 를 reset 한다.
     * @private
     */
    function _resetKeyword() {
      $scope.keyword = '';
    }

    /**
     * search box 에 focus 를 준다.
     * @private
     */
    function _setFocus() {
      $('#right-panel-search-box').focus();
    }

  }
})();

