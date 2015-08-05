/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelStarsTabCtrl', RightPanelStarsTabCtrl);

  /* @ngInject */
  function RightPanelStarsTabCtrl($scope, $filter, $state, $timeout, Router, StarAPIService) {
    var starListData = {
      messageId: null
    };
    var isActivated;

    _init();

    // First function to be called.
    function _init() {
      $scope.all = [];
      $scope.files = [];

      // °¢ tabÀ» °¢°¢ÀÇ controller·Î ÂÉ°³¾ßµÊ
      $scope.tabs = {
        all: {
          isLoading: false,
          isScrollLoading: false,
          removeItems: [],
          timerRemoveItems: null,
          name: $filter('translate')('@star-all'),
          active: true,
          endOfList: false,
          empty: false
        },
        files: {
          isLoading: false,
          isScrollLoading: false,
          removeItems: [],
          timerRemoveItems: null,
          name: $filter('translate')('@star-files'),
          active: false,
          endOfList: false,
          empty: false
        }
      };
      $scope.activeTabName = 'all';

      $scope.loadMore = loadMore;
      $scope.messageType = $scope.fileType = 'star';

      $scope.onTabSelect = onTabSelect;

      _initStarListData($scope.activeTabName);

      if (Router.getActiveRightTabName($state.current) === 'stars') {
        isActivated = true;

        //_initGetStarList();
      }
    }

    $scope.$on('onRightPanel', function($event, type) {
      if (type === 'stars') {
        isActivated = true;

        _initStarListData($scope.activeTabName);
        _initGetStarList($scope.activeTabName);
      } else {
        isActivated = false;
      }
    });

    $scope.$on('removeStarredItem', function($event, type, item) {
      var activeTabName = item.activeTabName;
      var tab = $scope.tabs[activeTabName];
      var removeItems = tab.removeItems;
      var list = $scope[activeTabName];

      if (type === 'add') {
        removeItems.push(item);
        $timeout.cancel(tab.timerRemoveItems);
        tab.timerRemoveItems = $timeout((function(activeTabName, removeItems, list) {
          return function() {
            var item;
            var index;

            for (;item = removeItems.pop();) {
              index = list.indexOf(item);
              if (index > -1) {
                list.splice(index, 1);
              }
            }

            if (list.length === 0) {
              $scope.tabs[activeTabName].empty = true;
              $scope.tabs[activeTabName].endOfList = false;
            }
          };
        }(activeTabName, removeItems, list)), 2000);
      } else if (type === 'remove') {
        index = list.indexOf(item);
        if (index > -1) {
          list.splice(index, 1);
        }
      }
    });

    function loadMore() {
      var activeTabName = $scope.activeTabName;

      if (!($scope.tabs[activeTabName].isScrollLoading || $scope.tabs[$scope.activeTabName].endOfList)) {
        $scope.tabs[activeTabName].isScrollLoading = true;

        _getStarList(activeTabName);
      }
    }

    function onTabSelect(type) {
      if (isActivated) {
        $scope.tabs[type].active = true;
        $scope.activeTabName = type;

        _initStarListData($scope.activeTabName);
        _initGetStarList($scope.activeTabName);
      }
    }

    function _initGetStarList(activeTabName) {
      $scope.tabs[activeTabName].isLoading = true;
      $scope.tabs[activeTabName].empty = false;
      _getStarList(activeTabName);
    }

    function _initStarListData(activeTabName) {
      starListData.messageId = null;

      $scope[activeTabName] = [];

      $scope.tabs[activeTabName].endOfList = $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;
    }

    function _getStarList(activeTabName) {
      if (!$scope.tabs[activeTabName].isLoading || !$scope.tabs[activeTabName].isScrollLoading) {
        StarAPIService.get(starListData.messageId, 20, (activeTabName === 'files' ? 'file' : undefined))
          .success(function(data) {
            if (data) {
              if (data.records && data.records.length) {
                _pushStarList(data.records, activeTabName);
              }

              _updateCursor(data, activeTabName);
            }
          })
          .finally(function() {
            $scope.tabs[activeTabName].empty = $scope[activeTabName].length === 0;
            $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;
          });
      }
    }

    function _pushStarList(records, activeTabName) {
      var record;
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        record = records[i];

        record.activeTabName = activeTabName;
        $scope[activeTabName].push(records[i]);
      }
    }

    function _updateCursor(data, activeTabName) {
      if (data.records && data.records.length > 0) {
        starListData.messageId = data.records[data.records.length - 1].starredId;
      }

      if ($scope[activeTabName] && $scope[activeTabName].length > 0) {
        $scope.tabs[activeTabName].endOfList = !data.hasMore;
      }
    }
  }
})();
