/**
 * @fileoverview files controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightFilesCtrl', RightFilesCtrl);

  function RightFilesCtrl($scope, $timeout, $state, $filter, RightPanel, fileAPIservice, analyticsService,
                          publicService, UserList, currentSessionHelper, AnalyticsHelper, modalHelper, Dialog,
                          TopicFolderModel, jndPubSub, RoomTopicList, RoomChatDmList) {
    var initialLoadDone = false;
    var startMessageId   = -1;
    var disabledMemberAddedOnSharedIn = false;
    var disabledMemberAddedOnSharedBy = false;

    var localCurrentEntity;
    var fileIdMap = {};
    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated;
    var _timerSearch;
    _init();

    function _init() {
      $scope.searchStatus = {
        keyword: '',
        length: ''
      };

      $scope.isLoading = false;
      $scope.isScrollLoading = false;
      $scope.isEndOfList = false;

      $scope.fileType = 'file';
      $scope.fileList = [];
      $scope.fileTitleQuery   = '';

      $scope.fileRequest      = {
        searchType: 'file',
        sharedEntityId: parseInt($state.params.entityId),
        startMessageId: -1,
        listCount: 10,
        keyword: ''
      };

      fileIdMap = {};

      $scope.loadMore = loadMore;

      $scope.onClickShare = onClickShare;
      $scope.onClickUnshare = onClickUnshare;

      $scope.isFiltered = isFilterred;
      $scope.isFileSearchQueryDefault = isFileSearchQueryDefault;
      $scope.isDisabledMember = isDisabledMember;

      // To be used in directive('centerHelpMessageContainer')
      $scope.emptyMessageStateHelper = 'NO_FILES_UPLOADED';

      $scope.isConnected = true;

      if (RightPanel.getStateName($state.current) === 'files') {
        _isActivated = true;
      }

      _initSharedInFilter();
      _initSharedByFilter(localCurrentEntity);
      _setDefaultSharedByFilter();
      _setLanguageVariable();

      localCurrentEntity = currentSessionHelper.getCurrentEntity();

      if (publicService.isNullOrUndefined(localCurrentEntity)) {
        // This may happen because file controller may be called before current entity is defined.
        // In this case, initialize options first then return from here
        return;
      }

      _setSharedInEntity(localCurrentEntity);

      // Checking if initial load has been processed or not.
      // if not, load once.
      if (!initialLoadDone) {
        _refreshFileList();
      }
    }

    $scope.$on('rPanelResetQuery', _onResetQuery);

    //  From profileViewerCtrl
    $scope.$on('updateFileWriterId', function(event, userId) {
      var entity = UserList.get(userId);

      _initSharedByFilter(entity);

      $scope.fileRequest.writerId = userId;
      _resetSearchStatusKeyword();
    });

    /**
     * When file type filter has been changed.
     */
    $scope.$on('updateFileTypeQuery', function(event, type) {
      _onUpdateFileTypeQuery(type);
    });

    //  fileRequest.writerId - 작성자
    $scope.$watch('fileRequest.writerId', function(newValue, oldValue) {
      //if ($scope.fileRequest.writerId === null) {
      //  $scope.fileRequest.writerId = 'all';
      //}

      if (newValue != oldValue) {
        _refreshFileList();
      }
    });

    //  fileRequest.fileType - 파일 타입
    $scope.$watch('fileRequest.fileType', function(newValue, oldValue) {
      if (newValue != oldValue) {
        _refreshFileList();
      }
    }, true);

    //  when sharedEntitySearchQuery is changed,
    //  1. check if value is null
    //      if null -> meaning searching for all chat rooms.
    //          else -> set to selected value.
    $scope.$watch('sharedEntitySearchQuery', function(newValue, oldValue) {
      if (publicService.isNullOrUndefined($scope.sharedEntitySearchQuery)) {
        // 'All'
        $scope.fileRequest.sharedEntityId = -1;
      } else {
        $scope.fileRequest.sharedEntityId = $scope.sharedEntitySearchQuery;
      }

      // If it's a new value, upd©ate file list.
      if ($scope.fileRequest.sharedEntityId != oldValue) {
        _refreshFileList();
      }
    });

    $scope.$on('topic-folder:update', _generateShareOptions);

    /**
     * socket 단위의 delete file event handler
     */
    $scope.$on('rightFileOnFileDeleted', function(event, param) {
      if (_isFileTabActive()) {
        if (_hasFileId(param.file.id)) {
          _refreshFileList();
        }
      }
    });

    /**
     * application 단위의 delete file event handler
     */
    $scope.$on('onFileDeleted', function() {
      _refreshFileList();
    });

    /**
     * 공유가능한 topic 변경 event handler
     * search filter도 변경되어야 하기 때문
     */
    $scope.$on('onChangeShared', function(event, data) {
      if (data) {
        if (_isFileStatusChangedOnCurrentFilter(data)) {
          // 'file_share' socket event에 대한 right panel 처리

          _refreshFileList();
        }
      }
    });

    /**
     * open right panel event handler
     */
    $scope.$on('rightPanelStatusChange', function($event, data) {
      if (data.type === 'files') {
        _isActivated = true;

        // fromUrl과 toUrl이 상이하고 fromUrl이 file detail로 부터 진행된 것이 아니거나
        // 최초 load가 수행되지 않았다면 file list 갱신함
        if ((data.toUrl !== data.fromUrl) &&
          (!initialLoadDone || data.fromTitle !== 'FILE DETAIL')) {
          _resetSearchStatusKeyword();
          _refreshFileList();
        }
      } else {
        _isActivated = false;
      }
    });

    /**
     * search의 file title 변경 event handler
     */
    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      if (_isActivated) {
        $scope.fileRequest.keyword = keyword;
        _refreshFileList();
      }
    });

    // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
    $scope.$on('connected', _onConnected);
    $scope.$on('disconnected', _onDisconnected);

    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    // advanced search option 중 'Shared in'/ 을 변경하는 부분.
    $scope.$on('onCurrentEntityChanged', function(event, currentEntity) {
      if (_isActivated && _hasLocalCurrentEntityChanged(currentEntity)) {
        //// 변경된 entity가 selectionOptions filter에 포함되지 않았다면 추가함.
        //$scope.selectOptions.indexOf(currentEntity) < 0 && $scope.selectOptions.push(currentEntity);

        localCurrentEntity = currentEntity;
        _setSharedInEntity(localCurrentEntity);
        _initSharedByFilter(localCurrentEntity);

        // search keyword reset
        _resetSearchStatusKeyword();
      }
    });

    /**
     * language 변경 event handling
     */
    $scope.$on('changedLanguage', function() {
      _setLanguageVariable();
    });

    /**
     * query 를 reset 한다
     * @private
     */
    function _onResetQuery() {
      if (_isActivated) {
        $scope.sharedEntitySearchQuery = null;
        _setDefaultSharedByFilter();
        _initFileTypeFilter();
      }
    }

    /**
     * has file id
     * @param {number} fileId
     * @returns {*}
     * @private
     */
    function _hasFileId(fileId) {
      return fileIdMap[fileId];
    }

    /**
     * search의 공유 topic options와 match되는 topic이면 함수 수행
     * @param {object} entity
     * @param {function} fn
     * @private
     */
    function _matchSelectOption(entity, fn) {
      var options = $scope.selectOptions;

      if (entity) {
        _.forEach(options, function(item, index) {
          if (item && item.id === entity.id) {
            fn(index, item);
          }
        });
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

      if ($scope.fileRequest.sharedEntityId === -1) {
        // 참여중인 모든 대화방
        result = true;
      } else if (data.room) {
        joinedEntity = RoomTopicList.get(data.room.id, true) || RoomChatDmList.getMember(data.room.id);
        if (joinedEntity.id === $scope.fileRequest.sharedEntityId) {
          result = true;
        }
      }

      return result;
    }

    function _refreshFileList() {
      if (_isFileTabActive() && $scope.isConnected) {
        /*
          rightPanelStatusChange 이벤트 및 모든 request payload의 파라미터의 watcher 에서 호출하기 때문에
         중복 호출을 방지하기 위하여 timeout 을 사용한다
         */
        $timeout.cancel(_timerSearch);
        _timerSearch = $timeout(function() {
          preLoadingSetup();
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
      if (isDisabledMember(currentMember)) {
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
      $scope.sharedEntitySearchQuery = entity.id;
    }

    /**
     * Initializing and setting 'Shared by' Options.
     * @private
     */
    function _initSharedByFilter(entity) {
      if (disabledMemberAddedOnSharedBy || !$scope.selectOptionsUsers) {
        // Very default setting.
        // Add myself to list as a default option.
        _addToSharedByOption($scope.member);
        disabledMemberAddedOnSharedBy = false;
      }

      // When accessing disabled member's file list.
      if (isDisabledMember(entity)) {
        _addToSharedByOption(entity);
        disabledMemberAddedOnSharedBy = true;
      }
    }

    /**
     * search의 topic type 기본값 설정
     * @private
     */
    function _setDefaultSharedByFilter() {
      $scope.fileRequest.writerId = 'all';
    }

    /**
     * Helper function of 'initSharedByFilter'.
     * @param member
     * @private
     */
    function _addToSharedByOption(member) {
      $scope.selectOptionsUsers = fileAPIservice.getShareOptions(currentSessionHelper.getCurrentTeamUserList());
    }

    /**
     * Initializing and setting 'File Type' Options.
     * @private
     */
    function _initFileTypeFilter() {
      $scope.fileTypeList = fileAPIservice.generateFileTypeFilter();
      $scope.fileRequest.fileType = $scope.fileTypeList[0].value;
    }

    /**
     * search의 file type 변경 event handler
     * @param type
     * @private
     */
    function _onUpdateFileTypeQuery(type) {
      var newType = '';
      if (type === 'you') {
        // when 'Your Files' is clicked on 'cpanel-search__dropdown'
        $scope.fileRequest.writerId = $scope.member.id;
        newType = 'all';
      }
      else {
        if (type === 'all') {
          // when 'All Files' is clicked oon 'cpanel-search__dropdown'
          $scope.fileRequest.writerId = 'all';
          $scope.sharedEntitySearchQuery = null;
        }
        newType = type;
      }

      _updateFileType(newType);
    }

    /**
     * Iterate through fileTypelist, which is generated by default, looking for 'type'.
     * Update $scope.fileTypeFilter variable after found match.
     *
     * @param type
     */
    function _updateFileType(type) {
      var fileType = {};
      _.forEach($scope.fileTypeList, function(object, index) {
        var value = object.value;

        if (value == type) {
          fileType = object;
          return false;
        }
      });
      $scope.fileRequest.fileType = fileType.value
    }

    /**
     * file list 전달 받기전 설정
     */
    function preLoadingSetup() {
        $scope.fileRequest.startMessageId   = -1;
        $scope.isEndOfList = false;
        $scope.isLoading = true;
        $scope.fileList = [];
    }

    /**
     * scrolling시 file list 불러오기
     */
    function loadMore() {
      if ($scope.isEndOfList || $scope.isScrollLoading) return;

      if ($scope.fileList.length==0 && $scope.fileRequest.keyword != '') {
        // No search result.
        return;
      }

      if (!$scope.isConnected) return;

      $scope.isScrollLoading = true;
      $scope.fileRequest.startMessageId = startMessageId;

      getFileList();
    }

    /**
     * file list 전달
     */
    function getFileList() {
      _updateSearchStatusKeyword();
      fileAPIservice.getFileList($scope.fileRequest)
        .success(function(response) {

          var fileList = [];

          //analytics
          if ($scope.fileRequest.keyword !== "") {
            try {
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, {
                'RESPONSE_SUCCESS': true,
                'SEARCH_KEYWORD': encodeURIComponent($scope.fileRequest.keyword)
              });
            } catch (e) {
            }
          }

          if (_isActivated) {
            var fileList = [];
            angular.forEach(response.files, function (entity, index) {

              var file = entity;
              file.shared = fileAPIservice.getSharedEntities(file);
              if (file.status != 'archived')
                this.push(file);
              fileIdMap[file.id] = true;

            }, fileList);

            generateFileList(fileList, response.fileCount, response.firstIdOfReceivedList);

            initialLoadDone = true;
          }
        })
        .error(function(response) {
          var property = {};
          var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
          //analytics
          if ($scope.fileRequest.keyword !== "") {
            try {
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, {
                'RESPONSE_SUCCESS': false,
                'ERROR_CODE': response.code
              });
            } catch (e) {
            }
          }
        })
        .finally(function() {
          _updateSearchStatusTotalCount();
        });
    }

    /**
     * file list 생성
     * @param {object} fileList
     * @param {number} fileCount
     * @param {} firstIdOfReceivedList
     */
    function generateFileList(fileList, fileCount, firstIdOfReceivedList) {
      // 마지막 list id를 local varidable에 설정
      startMessageId = firstIdOfReceivedList;

      if($scope.fileRequest.startMessageId === -1) {
        //  Not loading more.
        //  Replace current fileList with new fileList.
        $scope.fileList = fileList;
      } else {
        //  Loading more.
        //  Append fileList to current fileList
        _.forEach(fileList, function(item) {
          $scope.fileList.push(item);
        });
      }
      $scope.isScrollLoading = false;
      $scope.isLoading = false;

      if ($scope.fileList.length > 0 && fileCount < $scope.fileRequest.listCount) {
        $('.file-list__item.loading').addClass('opac_out');
        $scope.isEndOfList = true;
      }
    }

    /**
     * search status의 search하는 keyword 초기화
     * @private
     */
    function _resetSearchStatusKeyword() {
      $scope.searchStatus.keyword = $scope.fileRequest.keyword = '';
      jndPubSub.pub('resetRPanelSearchStatusKeyword');
    }

    /**
     * search status에 search한 keyword 설정
     * @private
     */
    function _updateSearchStatusKeyword() {
      $scope.searchStatus.keyword = $scope.fileRequest.keyword;
    }

    /**
     * search status에 file list의 length 설정
     * @param count
     * @private
     */
    function _updateSearchStatusTotalCount(count) {
      $scope.searchStatus.length = $scope.fileList.length;
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

          Dialog.success({
            title: $filter('translate')('@success-file-unshare').replace('{{filename}}', message.content.title)
          });
        })
        .error(function(err) {
          alert(err.msg);
        });
    }

    /**
     * 비활성 member 여부
     * @param {object} member
     * @returns {boolean|*}
     * @private
     */
    function isDisabledMember(member) {
      return !!member && publicService.isDisabledMember(member);
    }

    /**
     * files controller active 여부
     * @returns {*}
     * @private
     */
    function _isFileTabActive() {
      return _isActivated;
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

    /**
     * True if use never changed any value in file search filter.
     *
     * @returns {boolean}
     */
    function isFilterred() {
      return  !isFileSearchQueryDefault() ||
              !_isFileTypeDefault() ||
              !_isFileWriterIdDefault();
    }

    /**
     * Returns true when there is no search query.
     * 'isSearchQueryEmpty' is defined in right.controller.
     *
     * @returns {$scope.isSearchQueryEmpty|*}
     */
    function isFileSearchQueryDefault() {
      return $scope.isSearchQueryEmpty;
    }

    /**
     * True if fileType is still default value.
     *
     * Default value is set in '_initFileTypeFilter()' function.
     * @returns {boolean}
     * @private
     */
    function _isFileTypeDefault() {
      return $scope.fileRequest.fileType === 'all';
    }

    /**
     * True if file writer id has not been changed yet.
     *
     * default value is 'all', defined in '_setDefaultSharedByFilter()' function in this 1controller.
     *
     * @returns {boolean}
     * @private
     */
    function _isFileWriterIdDefault() {
      return $scope.fileRequest.writerId === 'all';
    }

    /**
     * controller내 사용되는 translate variable 설정
     */
    function _setLanguageVariable() {
      $scope.allRooms = $filter('translate')('@option-all-rooms');
      $scope.allMembers = $filter('translate')('@option-all-members');

      _initFileTypeFilter();
    }

    /**
     * 네트워크가 활성화되었을 때
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;
      _refreshFileList();
    }

    /**
     * 네크워크가 비황성화되었을 때
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }
  }
})();
