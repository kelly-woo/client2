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
  function rPanelCtrl($scope, $state, $filter, $timeout, jndPubSub, Router) {
    _init();

    /**
     * Default set-up.
     * @private
     */
    function _init() {
      var activeTabName;

      $scope.isSearchQueryEmpty = true;

      $scope.showLoading = showLoading;
      $scope.hideLoading = hideLoading;
      $scope.closeRightPanel = closeRightPanel;

      $scope.tabs = {
        files: {
          name: $filter('translate')('@common-files'),
          active: false
        },
        messages: {
          name: $filter('translate')('@common-message'),
          active: false
        },
        stars: {
          name: $filter('translate')('@common-star'),
          active: false
        },
        mentions: {
          name: $filter('translate')('@common-mention'),
          active: false
        }
      };

      $scope.isLoading = false;
      if (activeTabName = Router.getActiveRightTabName($state.current)) {
        $scope.tabs[activeTabName].active = true;
        $scope.activeTabName = $scope.tabs[activeTabName].name;
      }
    }

    $scope.$on('connected', _init);

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
     * right panel이 on 되었다는 event handling
     */
    $scope.$on('rightPanelStatusChange', function($event, data) {
      var tab;

      if (tab = $scope.tabs[data.type]) {
        if (data.toUrl !== data.fromUrl) {
          tab.active = true;
          $scope.activeTabName = tab.name;

          if (data.fromTitle !== 'FILE DETAIL') {
            $timeout(function() {
              jndPubSub.pub('resetRPanelSearchStatusKeyword');
              jndPubSub.pub('rPanelSearchFocus');
            }, 100);
          }
        }
      }
    });

    /**
     * keyword 가 비어있는 상태인지 아닌지 알아본다.
     * @param keyword {string} search input box 의 값
     * @private
     */
    function _updateSearchQueryEmptyStatus(keyword) {
      $scope.isSearchQueryEmpty =  !keyword;
    }

    /**
     * show loading screen
     */
    function showLoading() {
      $scope.isLoading = true;
    }

    /**
     * hide loading screen
     */
    function hideLoading() {
      $scope.isLoading = false;
    }

    /**
     * close right panel publish
     */
    function closeRightPanel() {
      jndPubSub.pub('closeRightPanel');
    }
  }
})();
