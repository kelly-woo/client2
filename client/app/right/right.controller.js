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
  function rPanelCtrl($scope, $state, $filter, jndPubSub) {
    _init();

    /**
     * Default set-up.
     * @private
     */
    function _init() {
      $scope.isSearchQueryEmpty = true;

      $scope.tabs = {
        file: {
          name: $filter('translate')('@common-files'),
          active: true
        },
        message: {
          name: $filter('translate')('@common-message'),
          active: false
        },
        star: {
          name: 'star',
          active: false
        },
        mention: {
          name: 'mention',
          active: false
        }
      };

      $scope.activeTabName = $scope.tabs.file.name;
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
     * right panel이 on 되었다는 event handling
     */
    $scope.$on('onRightPanel', function($event, type) {
      var tab;

      if (tab = $scope.tabs[type]) {
        tab.active = true;
        $scope.activeTabName = tab.name;

        // reset input element
        jndPubSub.pub('resetRPanelSearchStatusKeyword');
      }
      $state.go('messages.detail.files');
    });

    /**
     * keyword 가 비어있는 상태인지 아닌지 알아본다.
     * @param keyword {string} search input box 의 값
     * @private
     */
    function _updateSearchQueryEmptyStatus(keyword) {
      $scope.isSearchQueryEmpty =  !keyword;
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
     * close right panel
     */
    $scope.closeRightPanel = function() {
      jndPubSub.pub('closeRightPanel');
    };
  }
})();
