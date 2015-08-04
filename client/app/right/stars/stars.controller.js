/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelStarsTabCtrl', RightPanelStarsTabCtrl);

  /* @ngInject */
  function RightPanelStarsTabCtrl($scope, $filter, StarAPIService) {
    var starListData = {
      messageId: null
    };
    var isActivated;
  
    _init();

    // First function to be called.
    function _init() {
      $scope.all = [];
      $scope.files = [];

      $scope.tabs = {
        all: {
          name: $filter('translate')('@star-all'),
          active: true,
          endOfList: false,
          empty: false
        },
        files: {
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
      _initStarListData();
    }
  
    $scope.$on('onRightPanel', function($event, type) {
      if (type === 'star') {
        isActivated = true;
  
        _initStarListData();
        _initGetStarList();
      } else {
        isActivated = false;
      }
    });
  
    function loadMore() {
      if (!($scope.isScrollLoading || $scope.tabs[$scope.activeTabName].endOfList)) {
        $scope.isScrollLoading = true;
      
        _getStarList($scope.activeTabName);
      }
    }

    function onTabSelect(type) {
      if (isActivated) {
        $scope.tabs[type].active = true;
        $scope.activeTabName = type;

        _initStarListData();
        _initGetStarList();
      }
    }
  
    function _initGetStarList() {
      $scope.isLoading = true;
      $scope.tabs[$scope.activeTabName].empty = false;
      _getStarList($scope.activeTabName);
    }
  
    function _initStarListData() {
      starListData.messageId = null;

      $scope[$scope.activeTabName] = [];
      $scope.tabs[$scope.activeTabName].endOfList = $scope.isLoading = $scope.isScrollLoading = false;
    }
  
    function _getStarList(activeTabName) {
      StarAPIService.get(starListData.messageId, 20, (activeTabName === 'files' ? 'file' : undefined))
        .success(function(data) {
          if (data) {
            if (data.records && data.records.length) {
              _pushStarList(data.records);
            }

            _updateCursor(data);
          }
        })
        .finally(function() {
          $scope.tabs[$scope.activeTabName].empty = $scope[activeTabName].length === 0;
          $scope.isLoading = $scope.isScrollLoading = false;
        });
    }
  
    function _pushStarList(records) {
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        $scope[$scope.activeTabName].push(records[i]);
      }
    }
  
    function _updateCursor(data) {
      if (data.records && data.records.length > 0) {
        starListData.messageId = data.records[data.records.length - 1].message.id;
      }

      if ($scope[$scope.activeTabName] && $scope[$scope.activeTabName].length > 0) {
        $scope.tabs[$scope.activeTabName].endOfList = !data.hasMore;
      }
    }
  }
})();
