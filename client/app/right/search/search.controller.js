/**
 * @fileoverview right panel 상단에 위치한 search input box의 controller 이다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightSearchCtrl', RightSearchCtrl);

  /* @ngInject */
  function RightSearchCtrl($scope, $filter, jndPubSub) {
    $scope.resetQuery = resetQuery;

    _init();

    // First function to be called.
    function _init() {
      $scope.isConnected = true;
      _setLanguageVariable();
      _addEventListener();
    }

    function _addEventListener() {
      /**
       * 외부에서 'resetRPnaelSearchStatusKeyword' 라는 이벤트를 날리면 현재 하지고 있는 keyword value 를 reset 한다.
       */
      $scope.$on('resetRPanelSearchStatusKeyword', _resetKeyword);
      /**
       * search box 에 focus 를 준다.
       */
      $scope.$on('rPanelSearchFocus', _setFocus);
      /**
       * language 변경 event handling
       */
      $scope.$on('changedLanguage', _setLanguageVariable);
      $scope.$on('disconnected', _onDisconnected);
      $scope.$on('connected', _onConnected);
    }

    /**
     * search box 안에 값이 입력이 되고 사용자가 enter 를 눌렀을 경우 실행된다.
     * 현재 가지고 있는 keyword 와 함게 이벤트를 broadcast 한다.
     */
    $scope.onFileTitleQueryEnter = function(value) {
      jndPubSub.pub('onrPanelFileTitleQueryChanged', value);
    };


    /**
     * query를 reset 한다
     * @param {event} clickEvent
     */
    function resetQuery(clickEvent) {
      jndPubSub.pub('rPanelResetQuery');
    }

    /**
     * 현재 가지고 있는 keyword 를 reset 한다.
     * @private
     */
    function _resetKeyword() {
      $scope.keyword = '';
      $('#right-panel-search-box').val('');
    }

    /**
     * search box 에 focus 를 준다.
     * @private
     */
    function _setFocus() {
      $('#right-panel-search-box').focus();
    }

    /**
     * controller내 사용되는 translate variable 설정
     */
    function _setLanguageVariable() {
      $scope.placeholder = $filter('translate')('@input-search-file-title');
    }

    /**
     * socket disconnection handler
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }

    /**
     * socket connection handler
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;
    }

  }
})();
