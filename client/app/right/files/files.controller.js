(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelFileTabCtrl', rPanelFileTabCtrl);

  function rPanelFileTabCtrl($scope, $rootScope, $state, $filter, Router, entityheaderAPIservice,
                             fileAPIservice, analyticsService, publicService, entityAPIservice,
                             currentSessionHelper, logger, AnalyticsHelper, EntityMapManager) {
    var initialLoadDone = false;
    var startMessageId   = -1;
    var disabledMemberAddedOnSharedIn = false;
    var disabledMemberAddedOnSharedBy = false;

    var localCreatedTopicId;
    var localCurrentEntity;
    var fileIdMap = {};
    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated;

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

      // To be used in directive('centerHelpMessageContainer')
      $scope.emptyMessageStateHelper = 'NO_FILES_UPLOADED';

      $scope.isConnected = true;

      if (Router.getActiveRightTabName($state.current) === 'files') {
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

    //  fileRequest.writerId - 작성자
    $scope.$watch('fileRequest.writerId', function(newValue, oldValue) {
      if ($scope.fileRequest.writerId === null) {
        $scope.fileRequest.writerId = 'all';
      }

      if (newValue != oldValue) {
        _refreshFileList();
      }
    });

    //  fileRequest.fileType - 파일 타입
    $scope.$watch('fileTypeFilter', function(newValue, oldValue) {
      if (newValue != oldValue) {
        $scope.fileRequest.fileType = newValue.value;
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

    $scope.$on('rightFileOnFileDeleted', function(event, param) {
      if (_isFileTabActive()) {
        if (_hasFileId(param.file.id)) {
          _refreshFileList();
        }
      }
    });

    function _hasFileId(fileId) {
      return fileIdMap[fileId];
    }

    /**
     * Joined new entity or Left current entity
     *
     *  1. Re-initialize shared in select options
     *  2. re-initialize shared in filter.
     */
    $scope.$on('onJoinedTopicListChanged_leftInitDone', function(event, param) {
      logger.log('onJoinedTopicListChanged_leftInitDone');
      _generateShareOptions();

    });

    $scope.$on('onFileDeleted', function() {
      _refreshFileList();
    });

    $scope.$on('onChangeShared', function(event, data) {
      if (data) {
        if (data.event === 'topic_deleted' || data.event === 'topic_left') {
          // topic_deleted 또는 topic_left의 경우 해당 topic을 selectOptions에서 제거한다.
          _matchSelectOption(EntityMapManager.get('total', data.topic.id), function(index) {
            $scope.selectOptions.splice(index, 1);
          });
        } else if (data.event === 'topic_created' || data.event === 'topic_joined') {
          // topic_created 또는 topic_joined의 경우 해당 topic을 selectOptions에 추가해야 한다
          // 그러나 onChangeShared에서는 처리할 수 없으므로 onCurrentEntityChanged에서 처리하기
          // 위하여 event data만 변수에 저장한다.
          localCreatedTopicId = data.topic.id;
        } else if (_isFileStatusChangedOnCurrentFilter(data)) {
          // 'file_share' socket event에 대한 right panel 처리

          _refreshFileList();
        }
      }
    });

    function _matchSelectOption(target, fn) {
      var options = $scope.selectOptions;

      if (target) {
        _.forEach(options, function(item, index) {
          if (item && item.id === target.id) {
            fn(index, item);
          }
        });
      }
    }

    /**
     * Check if data.room.id(an id of entity where file is shared/unshared) is same as currently selected filter.
     *
     * @param data
     * @returns {boolean}
     * @private
     */
    function _isFileStatusChangedOnCurrentFilter(data) {
      return data.room && data.room.id === $scope.fileRequest.sharedEntityId;
    }

    $scope.$on('onRightPanel', function($event, data) {
      if (data.type === 'files') {
        _isActivated = true;
        $scope.fileRequest.keyword = '';

        // files uri에서 files uri로 변경시 'onRightPanel'에서 file list refresh 하지 않음
        // 'onCurrentEntityChanged'에서 file list refresh 함
        if (!data.toUrl || !data.fromUrl || (data.toUrl !== data.fromUrl)) {

          _refreshFileList();
        }
      } else {
        _isActivated = false;
      }
    });

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      if (_isActivated) {
        $scope.fileRequest.keyword = keyword;
        _refreshFileList();
      }
    });

    //  From profileViewerCtrl
    $rootScope.$on('updateFileWriterId', function(event, userId) {
      var entity = entityAPIservice.getEntityFromListById($scope.memberList, userId);

      _initSharedByFilter(entity);

      $scope.fileRequest.writerId = userId;
      _resetSearchStatusKeyword();

    });

    // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
    $scope.$on('connected', _onConnected);
    $scope.$on('disconnected', _onDisconnected);

    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    //  advanced search option 중 'Shared in'/ 을 변경하는 부분.
    $scope.$on('onCurrentEntityChanged', function(event, currentEntity) {
      var target;
      var hasMatchItem;

      if (_hasLocalCurrentEntityChanged(currentEntity)) {
        //// 변경된 entity가 selectionOptions filter에 포함되지 않았다면 추가함.
        //$scope.selectOptions.indexOf(currentEntity) < 0 && $scope.selectOptions.push(currentEntity);

        localCurrentEntity = currentEntity;
        _setSharedInEntity(localCurrentEntity);
        _initSharedByFilter(localCurrentEntity);
      }

      if (localCreatedTopicId) {
        target = EntityMapManager.get('total', localCreatedTopicId);
        hasMatchItem = false;
        _matchSelectOption(target, function() {
          hasMatchItem = true;
        });

        if (!hasMatchItem) {
          $scope.selectOptions.push(target)
        }
        localCreatedTopicId = false;
      }

    });

    /**
     * language 변경 event handling
     */
    $scope.$on('changedLanguage', function() {
      _setLanguageVariable();
    });

    function _refreshFileList() {
      if (_isFileTabActive() && $scope.isConnected) {
        preLoadingSetup();
        getFileList();
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
        $scope.selectOptions = $scope.selectOptions.concat(currentMember);
        disabledMemberAddedOnSharedIn = true;
      }
    }

    function _generateShareOptions() {
      //console.log('generating shared options')
      $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
    }

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
      if (_isDisabledMember(entity)) {
        _addToSharedByOption(entity);
        disabledMemberAddedOnSharedBy = true;
      }
    }

    function _setDefaultSharedByFilter() {
      $scope.fileRequest.writerId = 'all';
    }

    /**
     * Helper function of 'initSharedByFilter'.
     * @param member
     * @private
     */
    function _addToSharedByOption(member) {
      $scope.selectOptionsUsers = fileAPIservice.getShareOptions($scope.memberList);
    }

    /**
     * Initializing and setting 'File Type' Options.
     * @private
     */
    function _initFileTypeFilter() {
      $scope.fileTypeList = fileAPIservice.generateFileTypeFilter();
      $scope.fileTypeFilter = $scope.fileTypeList[0];
      $scope.fileRequest.fileType = $scope.fileTypeFilter.value
    }


    /**
     * When file type filter has been changed.
     */
    $rootScope.$on('updateFileTypeQuery', function(event, type) {
      _onUpdateFileTypeQuery(type);
    });

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
      $scope.fileTypeFilter = fileType
    }

    function preLoadingSetup() {
        $scope.fileRequest.startMessageId   = -1;
        $scope.isEndOfList = false;
        $scope.isLoading = true;
        $scope.fileList = [];
    }

    $scope.loadMore = function() {
      if ($scope.isEndOfList || $scope.isScrollLoading) return;

      if ($scope.fileList.length==0 && $scope.fileRequest.keyword != '') {
        // No search result.
        return;
      }

      if (!$scope.isConnected) return;

      $scope.isScrollLoading = true;
      $scope.fileRequest.startMessageId = startMessageId;

      getFileList();
    };


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

    function generateFileList(fileList, fileCount, firstIdOfReceivedList) {
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

    function _resetSearchStatusKeyword() {
      $scope.fileRequest.keyword = '';
      $scope.searchStatus.keyword = $scope.fileRequest.keyword;
      $rootScope.$broadcast('resetRPanelSearchStatusKeyword');
    }
    function _updateSearchStatusKeyword() {
      $scope.searchStatus.keyword = $scope.fileRequest.keyword;
    }

    function _updateSearchStatusTotalCount(count) {
      $scope.searchStatus.length = $scope.fileList.length;
    }

    $scope.onClickShare = function(file) {
      fileAPIservice.openFileShareModal($scope, file);
    };

    $scope.onClickUnshare = function(message, entity) {
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
        })
        .error(function(err) {
          alert(err.msg);
        });
    };

    $scope.onClickSharedEntity = function(entityId) {
      var targetEntity = fileAPIservice.getEntityById($scope.totalEntities, entityId);
      if (fileAPIservice.isMember(targetEntity, $scope.member)) {
        $state.go('archives', { entityType: targetEntity.type + 's', entityId: targetEntity.id });
      } else {
        entityheaderAPIservice.joinChannel(targetEntity.id)
          .success(function(response) {
            $rootScope.$emit('updateLeftPanelCaller');
            $state.go('archives', {entityType:targetEntity.type + 's',  entityId:targetEntity.id});
            analyticsService.mixpanelTrack( "topic Join" );

          })
          .error(function(err) {
            alert(err.msg);
          });
      }
    };



    $scope.isDisabledMember = function(member) {
      return _isDisabledMember(member);
    };

    function _isDisabledMember(member) {
      return !!member && publicService.isDisabledMember(member);
    }

    function _isFileTabActive() {
      return _isActivated;
    }

    // _hasLocalCurrentEntityChanged 수행시 localCurrentEntity가 존재하지 않아 error 발생하므로
    // localCurrentEntity null check code 추가
    function _hasLocalCurrentEntityChanged(newCurrentEntity) {
      return !localCurrentEntity || localCurrentEntity.id !== newCurrentEntity.id;
    }


    /**
     * True if use never changed any value in file search filter.
     *
     * @returns {boolean}
     */
    $scope.isFiltered = function() {
      return  !isFileSearchQueryDefault() ||
              !_isFileTypeDefault() ||
              !_isFileWriterIdDefault();
    };

    $scope.isFileSearchQueryDefault = isFileSearchQueryDefault;
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
