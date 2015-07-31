/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelStarsTabCtrl', RightPanelStarsTabCtrl);

  /* @ngInject */
  function RightPanelStarsTabCtrl($scope, StarAPIService) {
    var starListData = {
      page: 1
    };
    var isEndOfList;
    var isActivated;
  
    _init();

    // First function to be called.
    function _init() {
      $scope.all = [];
      $scope.files = [];

      $scope.tabs = {
        all: {
          name: 'all',
          active: true
        },
        files: {
          name: 'files',
          active: false
        }
      };
      $scope.activeTabName = $scope.tabs.all.name;

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
      if (!($scope.isScrollLoading || isEndOfList)) {
        $scope.isScrollLoading = true;
      
        _getStarList($scope.activeTabName);
      }
    }

    function onTabSelect(type) {
      if (isActivated) {
        $scope.tabs[type].active = true;
        $scope.activeTabName = $scope.tabs[type].name;

        _initStarListData();
        _initGetStarList();
      }
    }
  
    function _initGetStarList() {
      $scope.isLoading = true;
      _getStarList($scope.activeTabName);
    }
  
    function _initStarListData() {
      starListData.page = 1;
    
      $scope[$scope.activeTabName] = [];
      $scope.isLoading = $scope.isScrollLoading = false;
    }
  
    function _getStarList() {
      StarAPIService.get(starListData.page, 20, $scope.activeTabName)
        .success(function(data) {
          if (data) {
            _updateCursor(data.cursor);
          
            if (data.records && data.records.length) {
              _pushStarList(data.records);
            }
          }
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
  
    function _updateCursor(cursor) {
      starListData.page = cursor.page + 1;
      isEndOfList = cursor.page >= cursor.pageCount;
    }
  }
})();
