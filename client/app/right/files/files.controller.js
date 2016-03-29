/**
 * @fileoverview files controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightFilesCtrl', RightFilesCtrl);

  function RightFilesCtrl($scope, $filter, $q, $state, $timeout, AnalyticsHelper, analyticsService,
                          currentSessionHelper, Dialog, fileAPIservice, FileDetail, modalHelper, publicService,
                          RightPanel, RoomChatDmList, RoomTopicList, TopicFolderModel, UserList) {
    var disabledMemberAddedOnSharedIn = false;
    var disabledMemberAddedOnSharedBy = false;

    var localCurrentEntity;
    var fileIdMap = {};
    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated;
    var _timerSearch;

    _init();

    function _init() {
      $scope.fileList = [];

      $scope.searchStatus = {
        keyword: '',
        sharedEntityId: parseInt($state.params.entityId),
        writerId: 'all',
        fileType: 'all',
        startMessageId: -1,
        listCount: 10,

        isSearching: false,
        isScrollLoading: false,
        isEndOfList: false,
        isInitDone: false,

        length: '',
        type: ''
      };

      fileIdMap = {};
      $scope.searchStatus.type = _getSearchStatusType();
      $scope.isConnected = true;

      $scope.isNoItem = isNoItem;
      $scope.isFiltered = isFiltered;
      $scope.isKeywordEmpty = isKeywordEmpty;

      $scope.onEnter = onEnter;
      $scope.onResetQuery = onResetQuery;

      $scope.loadMore = loadMore;

      $scope.onClickShare = onClickShare;
      $scope.onClickUnshare = onClickUnshare;

      if (RightPanel.getStateName($state.current) === 'files') {
        _isActivated = true;
      }

      localCurrentEntity = currentSessionHelper.getCurrentEntity();

      _initSharedInFilter();
      _initSharedByFilter(localCurrentEntity);
      _setDefaultSharedByFilter();
      _initFileTypeFilter();
      _setSharedInEntity(localCurrentEntity);

      //if (publicService.isNullOrUndefined(localCurrentEntity)) {
      //  // This may happen because file controller may be called before current entity is defined.
      //  // In this case, initialize options first then return from here
      //  return;
      //}

      _attachScopeEvents();
    }

    function _attachScopeEvents() {
      $scope.$on('topic-folder:update', _generateShareOptions);

      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);
      $scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
      $scope.$on('rightFileOnFileDeleted', _onFileDelete);
      $scope.$on('onFileDeleted', _onFileDelete);

      // 파일 공유, 파일 공유해제, 토픽이동에 대한 처리
      $scope.$on('onChangeShared', _onChangeShared);

      //  From profileViewerCtrl
      $scope.$on('updateFileWriterId', _onFileWriterIdChange);

      // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
      $scope.$on('connected', _onConnected);
      $scope.$on('disconnected', _onDisconnected);

      $scope.$watch('searchStatus.keyword', _onSearchKeywordChange);
      $scope.$watch('searchStatus.sharedEntityId', _onSearchEntityChange);
      $scope.$watch('searchStatus.writerId', _onSearchWriterChange);
      $scope.$watch('searchStatus.fileType', _onSearchFileTypeChange, true);
    }

    function _onSearchKeywordChange(keyword) {
      if (_isValidSearchKeyword()) {
        $scope.searchKeyword = keyword;
        _refreshFileList();
      }
    }

    function _onSearchEntityChange(newValue, oldValue) {
      if (newValue === null) {
        // newValue가 null 이면 모든 대화방인 '-1' 값을 뜻한다.
        newValue = -1;
      }

      if (newValue != oldValue) {
        _refreshFileList();
      }
    }

    function _onSearchWriterChange(newValue, oldValue) {
      if (newValue != oldValue) {
        _refreshFileList();
      }
    }

    function _onSearchFileTypeChange(newValue, oldValue) {
      if (newValue != oldValue) {
        _refreshFileList();
      }
    }

    function _onFileWriterIdChange(event, userId) {
      var entity = UserList.get(userId);

      $scope.searchStatus.writerId = userId;

      _initSharedByFilter(entity);
      _resetSearchStatusKeyword();
    }

    /**
     * open right panel event handler
     */
    function _onRightPanelStatusChange($event, data) {
      _isActivated = data.type === 'files';

      if (_isActivated) {
        if (!$scope.searchStatus.isInitDone) {
          _refreshFileList();
        }
      }
    }

    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    // advanced search option 중 'Shared in'/ 을 변경하는 부분.
    function _onCurrentEntityChanged(event, currentEntity) {
      if (_isActivated && _hasLocalCurrentEntityChanged(currentEntity)) {
        //// 변경된 entity가 selectionOptions filter에 포함되지 않았다면 추가함.
        //$scope.selectOptions.indexOf(currentEntity) < 0 && $scope.selectOptions.push(currentEntity);

        localCurrentEntity = currentEntity;
        _setSharedInEntity(localCurrentEntity);
        _initSharedByFilter(localCurrentEntity);

        // search keyword reset
        _resetSearchStatusKeyword();
      }
    }

    function onEnter() {
      _refreshFileList();
    }

    function _isValidSearchKeyword() {
      var keyword = $scope.searchStatus.keyword;
      return keyword === '' || keyword.length > 1;
    }

    /**
     * query 를 reset 한다
     * @private
     */
    function onResetQuery() {
      $scope.searchStatus.sharedEntityId = -1;
      _setDefaultSharedByFilter();
      _initFileTypeFilter();
    }

    /**
     * 공유가능한 topic 변경 event handler
     * search filter도 변경되어야 하기 때문
     */
    function _onChangeShared(event, data) {
      if (data) {
        if (_isFileStatusChangedOnCurrentFilter(data)) {

          // file_share와 file_unshare에 대한 처리를 file socket 이벤트로 처리해야 하지만 전달되는 data가 부족하므로
          // message 이벤트로 처리함.
          if (data.messageType === 'file_share') {
            _onFileShared(data);
          } else if (data.messageType === 'file_unshare') {
            _onFileUnshared(data);
          } else {
            _refreshFileList();
          }
        }
      }
    }

    /**
     * Check if data.room.id(an id of entity where file is shared/unshared) is same as currently selected filter.
     * @param data
     * @returns {boolean}
     * @private
     */
    function _isFileStatusChangedOnCurrentFilter(data) {
      var result = false;
      var joinedEntity;

      if ($scope.searchStatus.sharedEntityId === -1) {
        // 참여중인 모든 대화방
        result = true;
      } else if (data.room) {
        joinedEntity = RoomTopicList.get(data.room.id, true) || RoomChatDmList.getMember(data.room.id);
        if (joinedEntity.id === $scope.searchStatus.sharedEntityId) {
          result = true;
        }
      }

      return result;
    }

    function _onFileShared(data) {
      var fileId = data.file.id;

      _getFilteredFile(fileId)
        .then(function(file) {
          $scope.fileList.unshift(file);
          fileIdMap[file.id] = file;
        });
    }

    function _getFilteredFile(fileId) {
      var defer = $q.defer();

      FileDetail.get(fileId)
        .success(function(response) {
          var file = _getFile(response.messageDetails);

          if (file && _isFilteredFile(file)) {
            defer.resolve(file);
          }
        });

      return defer.promise;
    }

    function _isFilteredFile(file) {
      return ($scope.searchStatus.writerId === 'all' || $scope.searchStatus.writerId === file.writerId) &&
        ($scope.searchStatus.fileType === 'all' || $scope.searchStatus.fileType === file.content.filterType) &&
        ($scope.searchStatus.keyword === '' || file.content.title.indexOf($scope.searchStatus.keyword) > -1);
    }

    function _getFile(messageDetails) {
      var file;

      _.each(messageDetails, function(item) {
        if (item.contentType === 'file') {
          file = item;
          return false;
        }
      });

      return file;
    }

    /**
     * socket 단위의 file delete 이벤트 핸들러
     * @param $event
     * @param param
     * @private
     */
    function _onFileDelete($event, data) {
      var fileId = _.isNumber(data) ? data : data.file.id;

      _updateUnsharedFile(fileId);
    }

    function _onFileUnshared(data) {
      var fileId = data.file.id;

      _updateUnsharedFile(fileId);
    }

    function _updateUnsharedFile(fileId) {
      var file = fileIdMap[fileId];
      var fileList;

      if (file) {
        fileList = $scope.fileList;

        fileList.splice(fileList.indexOf(file), 1);
        delete fileIdMap[fileId];

        if (fileList.length === 0) {
          _refreshFileList();
        }
      }
    }

    function _refreshFileList(isSmooth) {
      if (_isActivated && $scope.isConnected) {
        $scope.searchStatus.isEndOfList = false;
        $scope.searchStatus.startMessageId = -1;

        if (!isSmooth) {
          $scope.searchStatus.isSearching = true;
          $scope.searchStatus.type = _getSearchStatusType();
        }

        /*
          rightPanelStatusChange 이벤트 및 모든 request payload의 파라미터의 watcher 에서 호출하기 때문에
         중복 호출을 방지하기 위하여 timeout 을 사용한다
         */
        $timeout.cancel(_timerSearch);
        _timerSearch = $timeout(function() {
          getFileList();
        }, 100);
      }
    }

    /**
     * Initializing and setting 'Shared in' Options.
     * @private
     */
    function _initSharedInFilter() {
      var currentMember = localCurrentEntity;

      /*
       What 'getShareOptions' is doing is basically to 'concat' two lists.
       Since 'concat' two lists may take O(n) time complexity, I want to call 'getShareOptions' as least times as possible.
       When disabled member is added to option, to take that disabled member out, just reset the list.
       */
      if (disabledMemberAddedOnSharedIn || !$scope.selectOptions) {
        // Very default setting.
        _generateShareOptions();
        disabledMemberAddedOnSharedIn = false;
      }

      // If current member is disabled member, add current member to options just for now.
      // Set the flag to true.
      if (_isDisabledMember(currentMember)) {
        $scope.selectOptions = TopicFolderModel.getNgOptions($scope.selectOptions.concat(currentMember));
        disabledMemberAddedOnSharedIn = true;
      }
    }

    /**
     * 공유 topic select options 생성
     * @private
     */
    function _generateShareOptions() {
      $scope.selectOptions = TopicFolderModel.getNgOptions(
        fileAPIservice.getShareOptionsWithoutMe(RoomTopicList.toJSON(true), currentSessionHelper.getCurrentTeamUserList())
      );
    }

    /**
     * 공유 topic 설정
     * @param {object} entity
     * @private
     */
    function _setSharedInEntity(entity) {
      $scope.searchStatus.sharedEntityId = entity.id;
    }

    /**
     * Initializing and setting 'Shared by' Options.
     * @private
     */
    function _initSharedByFilter(entity) {
      if (disabledMemberAddedOnSharedBy || !$scope.selectOptionsUsers) {
        // Very default setting.
        // Add myself to list as a default option.
        _addToSharedByOption();
        disabledMemberAddedOnSharedBy = false;
      }

      // When accessing disabled member's file list.
      if (_isDisabledMember(entity)) {
        _addToSharedByOption();
        disabledMemberAddedOnSharedBy = true;
      }
    }

    /**
     * search의 topic type 기본값 설정
     * @private
     */
    function _setDefaultSharedByFilter() {
      $scope.searchStatus.writerId = 'all';
    }

    /**
     * Helper function of 'initSharedByFilter'.
     * @private
     */
    function _addToSharedByOption() {
      $scope.selectOptionsUsers = fileAPIservice.getShareOptions(currentSessionHelper.getCurrentTeamUserList());
    }

    /**
     * Initializing and setting 'File Type' Options.
     * @private
     */
    function _initFileTypeFilter() {
      $scope.fileTypeList = fileAPIservice.generateFileTypeFilter();
      $scope.searchStatus.fileType = $scope.fileTypeList[0].value;
    }

    /**
     * scrolling시 file list 불러오기
     */
    function loadMore() {
      if (_isValidLoadMore()) {
        $scope.searchStatus.isScrollLoading = true;

        getFileList();
      }
    }

    function _isValidLoadMore() {
      return !$scope.searchStatus.isEndOfList &&
          !$scope.searchStatus.isScrollLoading &&
          !($scope.fileList.length === 0 && $scope.searchStatus.keyword !== '') &&
          $scope.isConnected;
    }

    /**
     * file list 전달
     */
    function getFileList() {
      fileAPIservice.getFileList($scope.searchStatus)
        .success(function(response) {
          _analyticsFileListSuccess();
          _successFileList(response);
        })
        .error(function(error) {
          _analyticsFileListError(error);
        })
        .finally(function() {
          // search status에 file list의 length 설정
          $scope.searchStatus.length = $scope.fileList.length;
        });
    }

    function _successFileList(response) {
      if ($scope.searchStatus.startMessageId === -1) {
        //  Not loading more.
        //  Replace current fileList with new fileList.
        $scope.fileList = [];
      }

      _.each(response.files, function(file) {
        file.shared = fileAPIservice.getSharedEntities(file);

        if (file.status !== 'archived') {
          $scope.fileList.push(file);
          fileIdMap[file.id] = file;
        }
      });

      _setSearchStatus(response.fileCount, response.firstIdOfReceivedList);
    }

    /**
     * file list 생성
     * @param {object} fileList
     * @param {number} fileCount
     * @param {} firstIdOfReceivedList
     */
    function _setSearchStatus(fileCount, firstIdOfReceivedList) {
      // 마지막 list id를 local varidable에 설정
      $scope.searchStatus.startMessageId = firstIdOfReceivedList;

      $scope.searchStatus.isSearching = false;
      $scope.searchStatus.isScrollLoading = false;
      $scope.searchStatus.isEndOfList = $scope.fileList.length > 0 && $scope.searchStatus.listCount > fileCount;
      $scope.searchStatus.isInitDone = true;

      $scope.searchStatus.type = _getSearchStatusType();
    }

    /**
     * search status의 search하는 keyword 초기화
     * @private
     */
    function _resetSearchStatusKeyword() {
      $scope.searchStatus.keyword = '';
    }

    /**
     * open share modal event handler
     * @param file
     */
    function onClickShare(file) {
      modalHelper.openFileShareModal($scope, file);
    }

    /**
     * unshared event handler
     * @param message
     * @param entity
     */
    function onClickUnshare(message, entity) {
      fileAPIservice.unShareEntity(message.id, entity.id)
        .success(function() {
          _analyticsUnshareSuccess();

          Dialog.success({
            title: $filter('translate')('@success-file-unshare').replace('{{filename}}', message.content.title)
          });
        });
    }

    /**
     * 비활성 member 여부
     * @param {object} member
     * @returns {boolean|*}
     * @private
     */
    function _isDisabledMember(member) {
      return !!member && publicService.isDisabledMember(member);
    }

    /**
     * _hasLocalCurrentEntityChanged 수행시 localCurrentEntity가 존재하지 않아 error 발생하므로
     * localCurrentEntity null check code 추가
     * @param {object} newCurrentEntity
     * @returns {boolean}
     * @private
     */
    function _hasLocalCurrentEntityChanged(newCurrentEntity) {
      return !localCurrentEntity || localCurrentEntity.id !== newCurrentEntity.id;
    }

    function isNoItem() {
      return $scope.fileList.length == 0 &&
             $scope.searchStatus.isInitDone &&
             !$scope.searchStatus.isSearching;
    }

    /**
     * True if use never changed any value in file search filter.
     *
     * @returns {boolean}
     */
    function isFiltered() {
      return  !isKeywordEmpty() ||
              !($scope.searchStatus.fileType === 'all') ||
              !($scope.searchStatus.writerId === 'all');
    }

    function isKeywordEmpty() {
      return !$scope.searchStatus.keyword;
    }

    /**
     * 네트워크가 활성화되었을 때
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;

      if(_isActivated) {
        _refreshFileList();
      } else {
        $scope.searchStatus.isInitDone = false;
      }
    }

    /**
     * 네크워크가 비황성화되었을 때
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }

    function _getSearchStatusType() {
      var type;

      if ($scope.searchStatus.isSearching) {
        type = 'progress';
      } else if (!$scope.searchStatus.isSearching &&
                !isKeywordEmpty() &&
                $scope.fileList.length > 0) {
        type = 'result';
      }

      return type || '';
    }

    /////////////////////////////////////////// analytics ////////////////////////////////////////////////

    /**
     * 파일 목록 성공 analytics
     * @private
     */
    function _analyticsFileListSuccess() {
      if ($scope.searchStatus.keyword !== "") {
        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, {
            'RESPONSE_SUCCESS': true,
            'SEARCH_KEYWORD': encodeURIComponent($scope.searchStatus.keyword)
          });
        } catch (e) {
        }
      }
    }

    /**
     * 파일 목록 에러 analytics
     * @param {object} error
     * @private
     */
    function _analyticsFileListError(error) {
      if ($scope.searchStatus.keyword !== "") {
        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, {
            'RESPONSE_SUCCESS': false,
            'ERROR_CODE': error.code
          });
        } catch (e) {
        }
      }
    }

    /**
     * 공유 해제성공 analytics
     * @private
     */
    function _analyticsUnshareSuccess() {
      // analytics
      var share_target = "";
      switch (entity.type) {
        case 'channel':
          share_target = "topic";
          break;
        case 'privateGroup':
          share_target = "private group";
          break;
        case 'user':
          share_target = "direct message";
          break;
        default:
          share_target = "invalid";
          break;
      }
      var file_meta = (message.content.type).split("/");
      var share_data = {
        "entity type"   : share_target,
        "category"      : file_meta[0],
        "extension"     : message.content.ext,
        "mime type"     : message.content.type,
        "size"          : message.content.size
      };
      analyticsService.mixpanelTrack( "File Unshare", share_data );
    }
  }
})();
