/**
 * @fileoverview right panel 전체를 감싸고 있는 controller 이다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelCtrl', rPanelCtrl);

  /* ngInject */
  function rPanelCtrl($scope, jndPubSub, DeskTopNotificationBanner) {
    var fileTab;

    var messageTab;

    var tabSelectedCallbacks = {
      message: onMessageTabSelected,
      file: onFileTabSelected
    };


    _init();

    /**
     * Default set-up.
     * @private
     */
    function _init() {
      $scope.isSearchQueryEmpty = true;

      fileTab = {
        active: true
      };

      messageTab = {
        active: false
      };

      $scope.tabs = [fileTab, messageTab];
    }


    /**
     * right panel 상단에 있는 search input box 의 값이 없어졌다는 이벤트.
     */
    $scope.$on('resetRPanelSearchStatusKeyword', function() {
      _updateSearchQueryEmptyStatus();
    });

    /**
     * right panel 상단에 있는 search input box 의 값이 변했다는 이벤트.
     */
    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      _updateSearchQueryEmptyStatus(keyword);
    });

    /**
     * file tab 이 active 되었다는 이벤트.
     */
    $scope.$on('setFileTabActive', function() {
      _setFileTabStatus();
    });


    /**
     * file tab 이나 message tab 이 선택되어졌을 때 항상 호출된다.
     * @param selectedTab {string} 선택된 tab 의 이름.
     */
    $scope.onRightPanelTabSelected = function(selectedTab) {
      // search input box 의 값을 reset 시켜준다.
      jndPubSub.pub('resetRPanelSearchStatusKeyword');
      // TODO: 이렇게 펑션 불러도 되나요?
      tabSelectedCallbacks[selectedTab]();
    };

    /**
     * file tab 이 active 되었다는 이벤트.
     */
    function onFileTabSelected() {
      jndPubSub.pub('onrPanelFileTabSelected');
    }
    /**
     * message tab 이 active 되었다는 이벤트.
     */
    function onMessageTabSelected() {
      jndPubSub.pub('onrPanelMessageTabSelected');
    }

    /**
     * keyword 가 비어있는 상태인지 아닌지 알아본다.
     * @param keyword {string} search input box 의 값
     * @private
     */
    function _updateSearchQueryEmptyStatus(keyword) {
      $scope.isSearchQueryEmpty =  !keyword;
    }

    /**
     * 임의로 file tab 의 status 를 active 로 바꾼다.
     * @private
     */
    function _setFileTabStatus() {
      fileTab.active = true;
    }

    /**
     * 임의로 message tab 의 status 를 active 로 바꾼다.
     * @private
     */
    function _setMessageTabStatus() {
      messageTab.active = true;
    }

    // TODO: REFACTOR
    $scope.showLoading = function() {
      $scope.isLoading = true;
    };
    // TODO: REFACTOR
    $scope.hideLoading = function() {
      $scope.isLoading = false;
    };

    /**
     * file tab 이 active 인지 알아본다.
     * @returns {*} {boolean}
     */
    $scope.isFileTabActive = function() {
      return fileTab.active;
    };

    /**
     * file tab 이 active 인지 알아본다.
     @returns {*} {boolean}
     */
    $scope.isMessageTabActive = function() {
      return messageTab.active;
    };

  }

})();
