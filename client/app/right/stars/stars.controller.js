/**
 * @fileoverview stars controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelStarsTabCtrl', RightPanelStarsTabCtrl);

  /* @ngInject */
  function RightPanelStarsTabCtrl($scope, $filter, $state, $timeout, Router, StarAPIService, fileAPIservice) {
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
          // tab의 loading 상태 여부
          isLoading: false,
          // tab의 scroll loading 상태 여부
          isScrollLoading: false,
          // tab name
          name: $filter('translate')('@star-all'),
          // tab 활성화 여부
          active: true,
          // tab list 전체가 load 되었는지 여부
          endOfList: false,
          // tab 비어있는지 여부
          empty: false,
          // tab 첫 load가 되었는지 여부
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

      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      // open right panel
      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);

      // star / unstar
      $scope.$on('message:starred', _starred);
      $scope.$on('message:unStarred', _unStarred);

      // create/delete comment
      $scope.$on('rightFileDetailOnFileCommentCreated', _rightFileDetailOnFileCommentCreated);
      $scope.$on('rightFileDetailOnFileCommentDeleted', _rightFileDetailOnFileCommentDeleted);

      // delete message/file
      $scope.$on('topicMessageDelete', _topicMessageDelete);
      $scope.$on('rightFileDetailOnFileDeleted', _rightFileOnFileDeleted);
    }

    /**
     * open right panel event handler
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onRightPanelStatusChange($event, data) {
      if (data.type === 'stars') {
        isActivated = true;

        if (!$scope.tabs[$scope.activeTabName].hasFirstLoad) {
          // 'rightPanelStatusChange' event 발생시 tab(all, file)이 최초로 로드되는 시점에만 star list를 호출한다
          _initStarListData($scope.activeTabName);
          _initGetStarList($scope.activeTabName);
        }
      } else {
        isActivated = false;
      }
    }

    /**
     * starred event handler
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _starred($event, data) {
      var index;

      index = removeItems.indexOf(data.messageId);
      if (index > -1) {
        // starred된 item이 삭제목록에 존재한다면 삭제 목록에서 제거

        removeItems.splice(index, 1);
      } else {
        // star된 item을 star list에 추가

        _getStarItem(data.messageId);
      }
    }

    /**
     * unstarred event handler
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _unStarred($event, data) {
      var messageId = data.messageId;

      if ($scope.tabs.all.map[messageId]) {
        // unstar된 item이 star list에 존재한다면 삭제 목록에 추가함

        removeItems.push(messageId);

        // 일정 시간이 흐른 후 unstarred된 star list를 한번에 제거함
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
        }, 0);
      }
    }

    /**
     * delete message socket event
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _topicMessageDelete($event, data) {
      _removeStarItem('all', data.messageId);
      _removeStarItem('files', data.messageId);
    }

    /**
     * delete file socket event
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _rightFileOnFileDeleted($event, data) {
      _removeStarItem('all', data.file.id);
      _removeStarItem('files', data.file.id);
    }

    /**
     * create comment socket event
     */
    function _rightFileDetailOnFileCommentCreated($event, data) {
      _updateComment('create', data);
    }

    /**
     * delete comment socket event
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _rightFileDetailOnFileCommentDeleted($event, data) {
      _updateComment('delete', data);
    }

    /**
     * comment item 갱신
     * @param {string} type
     * @param {object} data
     * @private
     */
    function _updateComment(type, data) {
      var fileId;
      var commentCount;

      if (data.file) {
        fileId =  data.file.id;
        commentCount = data.file.commentCount;

        if (type === 'delete') {
          // 삭제된 comment가 tabs의 item으로 존재한다면 해당 item 삭제
          _removeStarItem('all', data.comment.id);
          _removeStarItem('files', data.comment.id);
        }

        _updateCommentCount('all', fileId, commentCount);
        _updateCommentCount('files', fileId, commentCount);
      }
    }

    /**
     * comment count 갱신
     * @param {string} activeTabName
     * @param {number} fileId
     * @param {number} count
     * @private
     */
    function _updateCommentCount(activeTabName, fileId, count) {
      var item;
      if (item = $scope.tabs[activeTabName].map[fileId]) {
        item.message.commentCount = count;
      }
    }

    /**
     * scrolling시 star list 불러오기
     */
    function loadMore() {
      var activeTabName = $scope.activeTabName;

      if (!($scope.tabs[activeTabName].isScrollLoading || $scope.tabs[$scope.activeTabName].endOfList)) {
        $scope.tabs[activeTabName].isScrollLoading = true;

        _getStarList(activeTabName);
      }
    }

    /**
     * tab(all,file) select event handler
     * @param {string} type
     */
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

    /**
     * tab(all,file) star list 초기화
     * @param {string} activeTabName
     * @private
     */
    function _initStarListData(activeTabName) {
      starListData.messageId = null;

      $scope.tabs[activeTabName].list = [];
      $scope.tabs[activeTabName].map = {};

      $scope.tabs[activeTabName].endOfList = $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;
    }

    /**
     * tab(all,file) star list 초기 load
     * @param {string} activeTabName
     * @private
     */
    function _initGetStarList(activeTabName) {
      $scope.tabs[activeTabName].isLoading = true;
      $scope.tabs[activeTabName].empty = false;

      _getStarList(activeTabName);
    }

    /**
     * star list 전달
     * @param {string} activeTabName
     * @private
     */
    function _getStarList(activeTabName) {
      if (!$scope.tabs[activeTabName].isLoading || !$scope.tabs[activeTabName].isScrollLoading) {
        StarAPIService.get(starListData.messageId, 40, (activeTabName === 'files' ? 'file' : undefined))
          .success(function(data) {
            if (data) {
              if (data.records && data.records.length) {
                _pushStarList(data.records, activeTabName);
              }

              // 다음 getStarList에 전달할 param 갱신
              _updateCursor(activeTabName, data);
            }
          })
          .finally(function() {
            $scope.tabs[activeTabName].hasFirstLoad = true;
            $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;

            $scope.tabs[activeTabName].list.length === 0 && _setEmptyTab(activeTabName, true);
          });
      }
    }

    /**
     * 특정 star item 전달
     * @param {string} messageId
     * @private
     */
    function _getStarItem(messageId) {
      StarAPIService.getItem(messageId)
        .success(function(data) {
          if (data) {
            _addStarItem('all', data, true);
            _setEmptyTab('all', false);

            if (data.message.contentType === 'file') {
              // star item이 file type이라면 files list에도 추가함
              _addStarItem('files', data, true);
              _setEmptyTab('files', false);
            }
          }
        });
    }

    /**
     * tab(all,file)의 list를 설정
     * @param {object} records
     * @param {string} activeTabName
     * @private
     */
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

    /**
     * tab(all,file)의 item을 추가
     * @param {string} activeTabName
     * @param {object} data
     * @param {boolean} isUnShift - unshift 또는 push 처리 여부
     * @private
     */
    function _addStarItem(activeTabName, data, isUnShift) {
      if ($scope.tabs[activeTabName].map[data.message.id] == null) {
        $scope.tabs[activeTabName].list[isUnShift ? 'unshift' : 'push'](data);
        $scope.tabs[activeTabName].map[data.message.id] = data;
      }
    }

    /**
     * tab(all,file)의 item을 제거
     * @param {string} activeTabName
     * @param {number} messageId
     * @private
     */
    function _removeStarItem(activeTabName, messageId) {
      var list = $scope.tabs[activeTabName].list;
      var map = $scope.tabs[activeTabName].map;
      var index;

      index = list.indexOf(map[messageId]);
      if (index > -1) {
        list.splice(index, 1);
        delete map[messageId];
      }

      if (!list.length) {
        _setEmptyTab(activeTabName, true);
      }
    }

    /**
     * 비어있는 tab(all, file)으로 설정
     * @param {string} activeTabName
     * @param {boolean} value
     * @private
     */
    function _setEmptyTab(activeTabName, value) {
      $scope.tabs[activeTabName].empty = value;
      $scope.tabs[activeTabName].endOfList = !value;
    }

    /**
     * 다음 star list를 얻어오는 param과 tab(all, file)의 상태 갱신
     * @param {string} activeTabName
     * @param {object} data
     * @private
     */
    function _updateCursor(activeTabName, data) {
      if (data.records && data.records.length > 0) {
        starListData.messageId = data.records[data.records.length - 1].starredId;
      }

      if ($scope.tabs[activeTabName].list && $scope.tabs[activeTabName].list.length > 0) {
        // 더이상 star list가 존재하지 않으므로 endOfList로 처리함
        $scope.tabs[activeTabName].endOfList = !data.hasMore;
      }
    }
  }
})();
