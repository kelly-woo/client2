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

    var removeItems = [];
    var timerRemoveItems;

    _init();

    // First function to be called.
    function _init() {
      // 각 tab을 각각의 controller로 쪼개야됨
      $scope.tabs = {
        all: {
          list: [],
          map: {},
          isLoading: false,
          isScrollLoading: false,
          name: $filter('translate')('@star-all'),
          active: true,
          endOfList: false,
          empty: false,
          hasFirstLoad: false
        },
        files: {
          list: [],
          map: {},
          isLoading: false,
          isScrollLoading: false,
          name: $filter('translate')('@star-files'),
          active: false,
          endOfList: false,
          empty: false,
          hasFirstLoad: false
        }
      };
      $scope.activeTabName = 'all';

      $scope.loadMore = loadMore;
      $scope.messageType = $scope.fileType = 'star';

      $scope.onTabSelect = onTabSelect;

      _initStarListData($scope.activeTabName);

      if (Router.getActiveRightTabName($state.current) === 'stars') {
        isActivated = true;

        // onTabSelect가 바로 수행되기 때문에 여기서 수행하지 않음
        //_initGetStarList();
      }
    }

    $scope.$on('onRightPanel', function($event, type) {
      if (type === 'stars') {
        isActivated = true;

        if (!$scope.tabs[$scope.activeTabName].hasFirstLoad) {
          _initStarListData($scope.activeTabName);
          _initGetStarList($scope.activeTabName);
        }
      } else {
        isActivated = false;
      }
    });

    // starred event handler
    $scope.$on('starred', function($event, data) {
      var index;

      index = removeItems.indexOf(data.messageId);
      if (index > -1) {
        removeItems.splice(index, 1);
      } else {
        _getStarItem(data.messageId);
      }
    });

    // unstarred event handler
    $scope.$on('unStarred', function($event, data) {
      var messageId = data.messageId;

      if ($scope.tabs.all.map[messageId]) {
        removeItems.push(messageId);

        $timeout.cancel(timerRemoveItems);
        timerRemoveItems = $timeout(function() {
            var messageId;

            for (;messageId = removeItems.pop();) {
              if ($scope.tabs.files.map[messageId]) {
                _removeStarItem('files', messageId);
              }

              _removeStarItem('all', messageId);
            }

            $scope.tabs.all.list.length === 0 && _setEmptyTab('all', true);
            $scope.tabs.files.list.length === 0 && _setEmptyTab('files', true);
        }, 2000);
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

        if (!$scope.tabs[type].hasFirstLoad) {
          _initStarListData($scope.activeTabName);
          _initGetStarList($scope.activeTabName);
        }
      }
    }

    function _initStarListData(activeTabName) {
      starListData.messageId = null;

      $scope.tabs[activeTabName].list = [];
      $scope.tabs[activeTabName].map = {};

      $scope.tabs[activeTabName].endOfList = $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;
    }

    function _initGetStarList(activeTabName) {
      $scope.tabs[activeTabName].isLoading = true;
      $scope.tabs[activeTabName].empty = false;

      _getStarList(activeTabName);
    }

    function _getStarList(activeTabName) {
      if (!$scope.tabs[activeTabName].isLoading || !$scope.tabs[activeTabName].isScrollLoading) {
        StarAPIService.get(starListData.messageId, 40, (activeTabName === 'files' ? 'file' : undefined))
          .success(function(data) {
            if (data) {
              if (data.records && data.records.length) {
                _pushStarList(data.records, activeTabName);
              }

              _updateCursor(data, activeTabName);
            }
          })
          .finally(function() {
            $scope.tabs[activeTabName].hasFirstLoad = true;
            $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;

            $scope.tabs[activeTabName].list.length === 0 && _setEmptyTab(activeTabName, true);
          });
      }
    }

    function _getStarItem(messageId) {
      StarAPIService.getItem(messageId)
        .success(function(data) {
          if (data) {
            _addStarItem('all', data, true);
            _setEmptyTab('all', false);

            if (data.message.contentType === 'file') {
              _addStarItem('files', data, true);
              _setEmptyTab('files', false);
            }
          }
        })
    }

    function _pushStarList(records, activeTabName) {
      var record;
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        record = records[i];

        record.activeTabName = activeTabName;
        _addStarItem(activeTabName, record);
      }
    }

    function _addStarItem(activeTabName, data, isUnShift) {
      if ($scope.tabs[activeTabName].map[data.message.id] == null) {
        $scope.tabs[activeTabName].list[isUnShift ? 'unshift' : 'push'](data);
        $scope.tabs[activeTabName].map[data.message.id] = data;
      }
    }

    function _removeStarItem(activeTabName, messageId) {
      var list = $scope.tabs[activeTabName].list;
      var map = $scope.tabs[activeTabName].map;
      var index;

      index = list.indexOf(map[messageId]);
      if (index > -1) {
        list.splice(index, 1);
        delete map[messageId];
      }
    }

    function _setEmptyTab(activeTabName, value) {
      $scope.tabs[activeTabName].empty = value;
      //$scope.tabs[activeTabName].endOfList = !value;
    }

    function _updateCursor(data, activeTabName) {
      if (data.records && data.records.length > 0) {
        starListData.messageId = data.records[data.records.length - 1].starredId;
      }

      if ($scope.tabs[activeTabName].list && $scope.tabs[activeTabName].list.length > 0) {
        $scope.tabs[activeTabName].endOfList = !data.hasMore;
      }
    }
  }
})();
