'use strict';

var app = angular.module('jandiApp');

app.controller('fileDetailCtrl', function ($scope, $rootScope, $state, $modal, $sce, $filter, $timeout, $q, $window,
                                           fileAPIservice, entityheaderAPIservice, analyticsService, entityAPIservice,
                                           memberService, publicService, configuration, modalHelper, jndPubSub,
                                           jndKeyCode, AnalyticsHelper, EntityMapManager, RouterHelper, Router) {
  var _sticker;
  var _stickerType;
  var fileId;
  var _commentIdToScroll;

  //file detail에서 integraiton preview로 들어갈 image map
  var noPreviewAvailableImage;

  _init();

  /**
   * 초기화 메서드
   * @private
   */
  function _init() {
    var activeMenu;

    if (/redirect/.test($state.current.name)) {
      // 왼쪽 상단에 표시되는 back to list해야되는 target
      if ($state.params.tail != null) {
        RouterHelper.setRightPanelTail($state.params.tail);
      }

      $state.go('messages.detail.' + (RouterHelper.getRightPanelTail() || 'files') + '.item', $state.params);
    } else {
      if (activeMenu = Router.getActiveRightTabName($state.current)) {
        RouterHelper.setRightPanelTail(activeMenu);
      }

      _stickerType = 'file';
      fileId = $state.params.itemId;

      if (!_.isUndefined(fileId)) {
        $scope.initialLoaded = false;
        $scope.file_detail = null;
        $scope.file_comments = [];
        $scope.glued = false;
        $scope.isPostingComment = false;
        $scope.hasFileAPIError = false;
        $scope.isLoadingImage = true;
        $scope.tail = 'file';


        // configuration for message loading
        $scope.fileLoadStatus = {
          loading: false
        };

        $scope.deleteComment = deleteComment;
        $scope.postComment = postComment;
        $scope.onImageClick = onImageClick;
        $scope.onClickDownload = onClickDownload;
        $scope.onClickShare = onClickShare;
        $scope.onClickUnshare = onClickUnshare;
        $scope.onClickSharedEntity = onClickSharedEntity;
        $scope.onFileDeleteClick = onFileDeleteClick;
        $scope.isDisabledMember = isDisabledMember;
        $scope.backToFileList = backToFileList;
        $scope.onUserClick = onUserClick;
        $scope.onCommentFocusClick = onCommentFocusClick;
        $scope.onKeyUp = onKeyUp;
        $scope.onFileDetailImageLoad = onFileDetailImageLoad;
        $scope.onStarClick = onStarClick;
        $scope.starComment = starComment;
        $scope.getCreateTime = getCreateTime;
        $scope.watchFileDetail = watchFileDetail;

        _initListeners();
        $scope.isPostingComment = false;

        getFileDetail();

        if (RouterHelper.hasCommentToScroll()) {
          _commentIdToScroll = RouterHelper.getCommentIdToScroll();
          RouterHelper.resetCommentIdToScroll();
        }
      }
    }
  }

  /**
   * listener 초기화
   * @private
   */
  function _initListeners() {
    $scope.$on('updateRightFileDetailPanel', _init);
    $scope.$on('rightFileDetailOnFileDeleted', _onFileChanged);
    $scope.$on('rightFileDetailOnFileCommentDeleted', _onFileChanged);
    $scope.$on('updateMemberProfile', _onUpdateMemberProfile);
    $scope.$on('updateFileDetailPanel', _onFileChanged);
    $scope.$on('setCommentFocus', _focusInput);
    $scope.$on('onChangeSticker:' + _stickerType, function (event, item) {
      _sticker = item;
      _focusInput();
    });

    /**
     * 공유 된 topic 변경 event handler
     */
    $scope.$on('onChangeShared', function(event, data) {
      var shareEntities = $scope.file_detail.shareEntities;

      if (_isFileDetailActive() && data && shareEntities.length === 1 &&
          ((data.event === "topic_deleted" && shareEntities[0] === data.topic.id) || (data.type === 'delete' && shareEntities[0] === data.id))) {
        // archived file 이고 event type이 'topic_deleted' 또는 shared 'delete' 일때
        // 마지막으로 shared topic이 삭제되는 것이라면 topic을 가지지 않은 것으로 표기함
        $scope.hasTopic = false;
      } else {
        getFileDetail();
      }
    });

    // share된 곳이 없는 file일 경우에도 file_detail 갱신 하도록 함.
    $scope.$on('rightFileDetailOnFileCommentCreated', function (event, param) {
      if (_isFileDetailActive()) {
        if (param.file.id === parseInt(fileId, 10)) {
          _onFileChanged(event, param);
        }
      }
    });
  }

  /**
   * updateMemberProfile 이벤트 발생시 이벤트 핸들러
   * @param {object} event
   * @param {{event: object, member: object}} data
   * @private
   */
  function _onUpdateMemberProfile(event, data) {
    var list = $scope.file_comments;
    var member = data.member;
    var id = member.id;
    //var url = $filter('getSmallThumbnail')(member);
    //console.log('filedetail: ', member);
    _.forEach(list, function(comment) {
      if (comment.writerId === id) {
        _addExtraData(comment, comment.writerId);
      }
    });
    if ($scope.file_detail && $scope.file_detail.writerId === id) {
      _addExtraData($scope.file_detail, $scope.file_detail.writerId);
    }
  }

  /**
   * file 상세정보를 조회한다.
   * @returns {*}
   */
  function getFileDetail() {
    var deferred = $q.defer();
    if (!$scope.fileLoadStatus.loading) {
      $scope.fileLoadStatus.loading = true;
      $timeout(function () {
        var fileDetail = fileAPIservice.dualFileDetail;

        if (fileDetail) {
          // 미리 조회된 file detail object가 존재한다면 fileApi로 request 안 보내고
          // 저장된 file detail을 그대로 사용함

          _onSuccessFileDetail(fileDetail);
        } else {
          fileAPIservice.getFileDetail(fileId)
            .success(_onSuccessFileDetail)
            .error(_onErrorFileDetail);
        }

        $scope.fileLoadStatus.loading = false;
        $('.file-detail-body').addClass('opac_in');
        deferred.resolve();
      }, 0);
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  /**
   * comment 를 posting 한다.
   */
  function postComment() {
    var msg = $('#file-detail-comment-input').val().trim();
    var content;
    var mentions;

    if (!$scope.isPostingComment && (msg || _sticker)) {
      _hideSticker();

      $scope.isPostingComment = true;

      if ($scope.getMentions) {
        if (content = $scope.getMentions()) {
          msg = content.msg;
          mentions = content.mentions;
        }
      }

      fileAPIservice.postComment(fileId, msg, _sticker, mentions)
        .success(function() {
          $scope.glued = true;
          $timeout(function() {
            $('#file-detail-comment-input').val('').focus();
          });
        })
        .error(function(err) {
        })
        .finally(function () {
          $scope.isPostingComment = false;
        });
    }
  }

  /**
   * comment 를 삭제한다.
   * @param {number} commentId 코멘트 ID
   * @param {boolean} [isSticker=false] sticker 삭제인지 여부
   */
  function deleteComment(commentId, isSticker) {
    if (isSticker) {
      fileAPIservice.deleteSticker(commentId)
        .success(_onSuccessDelete)
        .error(function(err) {
          _onErrorDelete(err, 'fileAPIservice.deleteSticker');
        });
    } else {
      fileAPIservice.deleteComment(fileId, commentId)
        .success(_onSuccessDelete)
        .error(function(err) {
          _onErrorDelete(err, 'fileAPIservice.deleteComment');
        });
    }
  }

  /**
   * keyDown 핸들러
   * @param keyUpEvent
   */
  function onKeyUp(keyUpEvent) {
    if (jndKeyCode.match('ESC', keyUpEvent.keyCode)) {
      _hideSticker();
    }
  }

  /**
   * user 이미지 클릭시 이벤트 핸들러
   * @param {object} user
   */
  function onUserClick(user) {
    if (_.isNumber(user)) {
      user = EntityMapManager.get('member', user);
    }
    $scope.$emit('onUserClick', user);
  }

  /**
   * 댓글 남기기 클릭 시 이벤트 핸들러
   */
  function onCommentFocusClick() {
    _focusInput();
  }

  /**
   * file detail에서 preview 공간에 들어갈 image의 url을 설정함
   */
  function setImageUrl(content) {
    // file detail에서 preview image 설정
    if ($filter('hasPreview')(content)) {
      $scope.ImageUrl = $scope.server_uploaded + content.fileUrl;
      $scope.hasZoomIn = true;
    } else {
      $scope.ImageUrl = $filter('getFilterTypePreview')(content);
      $scope.hasZoomIn = $filter('isIntegrationContent')(content);
    }
  }

  /**
   * 이미지 클릭시 이벤트 핸들러
   */
  function onImageClick() {
    var file_detail = $scope.file_detail;

    if ($filter('isIntegrationContent')(file_detail.content)) {
      window.open(file_detail.content.fileUrl, '_blank');
    } else {
      if ($scope.hasZoomIn) {
        modalHelper.openImageCarouselModal({
          // image file api data
          messageId: fileId,
          // image carousel view data
          userName: file_detail.writer.name,
          uploadDate: file_detail.createTime,
          fileTitle: file_detail.content.title,
          fileUrl: file_detail.content.fileUrl,
          // single
          isSingle: true
        });
      }
    }
  }

  /**
   * download 클릭시 이벤트 핸들러
   * @param {object} file
   */
  function onClickDownload(file) {
    // analytics
    var file_meta = (file.content.type).split("/");
    var download_data = {
      "category": file_meta[0],
      "extension": file.content.ext,
      "mime type": file.content.type,
      "size": file.content.size
    };
    analyticsService.mixpanelTrack("File Download", download_data);
  }

  /**
   * 공유 클릭시 이벤트 핸들러
   * @param file
   */
  function onClickShare(file) {
    fileAPIservice.openFileShareModal($scope, file);
  }

  /**
   * 공유 해제 클릭시 이벤트 핸들러
   * @param {object} message
   * @param {object} entity
   */
  function onClickUnshare(message, entity) {
    fileAPIservice.unShareEntity(message.id, entity.id)
      .success(function() {
        // 곧 지워짐.
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
          "entity type": share_target,
          "category": file_meta[0],
          "extension": message.content.ext,
          "mime type": message.content.type,
          "size": message.content.size
        };
        analyticsService.mixpanelTrack( "File Unshare", share_data );
        //

        var property = {};
        var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
        try {
          //analytics
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
            'RESPONSE_SUCCESS': true,
            'FILE_ID': message.id,
            'TOPIC_ID': entity.id
          });
        } catch (e) {
        }

      })
      .error(function(err) {
        alert(err.msg);
      });
  }

  /**
   * shared entity 클릭시 이벤트 핸들러
   * @param {string} entityId
   */
  function onClickSharedEntity(entityId, entityType) {
    if (entityType === 'users') {
      $state.go('archives', {entityType: entityType, entityId: entityId});
    } else {
      var targetEntity = entityAPIservice.getEntityFromListById($scope.joinedEntities, entityId);

      if (entityAPIservice.isJoinedTopic(targetEntity)) {
        // joined topic.
        $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
      } else {
        // Join topic first and go!
        entityheaderAPIservice.joinChannel(entityId)
          .success(function(response) {
            //analyticsService.mixpanelTrack( "topic Join" );
            //$rootScope.$emit('updateLeftPanelCaller');
            $state.go('archives', {entityType: 'channels',  entityId: entityId });
          })
          .error(function(err) {
            alert(err.msg);
          });
      }
    }
  }

  /**
   * file 삭제 클릭시 이벤트 핸들러
   * @param fileId
   */
  function onFileDeleteClick(fileInfo) {
    if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
      return;
    }

    var fileId = fileInfo;
    var property = {};
    var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;

    fileAPIservice.deleteFile(fileId)
      .success(function(response) {
        getFileDetail();
        try {
          //analytics
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
            'RESPONSE_SUCCESS': true,
            'FILE_ID': fileId
          });
        } catch (e) {
        }

        $rootScope.$broadcast('onFileDeleted', fileId);
      })
      .error(function(err) {
        console.log(err);
        try {
          //analytics
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
            'RESPONSE_SUCCESS': false,
            'ERROR_CODE': err.code
          });
        } catch (e) {
        }
      });
  }

  /**
   * 비활성 사용자인지 여부 반환
   * @param {object} member
   * @returns {*}
   */
  function isDisabledMember(member) {
    if (_.isNumber(member)) {
      member = EntityMapManager.get('member', member);
    }
    return publicService.isDisabledMember(member);
  }

  /**
   * file 정보 변경시 이벤트 핸들러
   * @param {object} event angular 이벤트
   * @param {object} param
   * @private
   */
  function _onFileChanged(event, param) {
    if (_isFileDetailActive()) {
      var deletedFileId = param.file.id;
      if (parseInt(fileId, 10) === deletedFileId) {
        getFileDetail();
      }
    }
  }

  /**
   * comment input 에 focus 한다.
   * @private
   */
  function _focusInput() {
    $('#file-detail-comment-input').focus();
  }

  /**
   * 스티커 레이어를 숨긴다.
   * @private
   */
  function _hideSticker() {
    jndPubSub.pub('deselectSticker:' + _stickerType);
  }

  /**
   * safeBody 를 반환한다.
   * @param {object} item
   * @returns {*}
   * @private
   */
  function _getSafeBody(item) {
    var body = item.content.body;

    if (_.isObject(body)) {
      body = body.valueOf();
    }

    if (item.mentions && item.mentions.length > 0) {
      body = $filter('mention')(body, item.mentions);
      body = $filter('parseAnchor')(body);
      body = $filter('mentionHtmlDecode')(body);
    } else {
      body = $filter('parseAnchor')(body);
    }

    return $sce.trustAsHtml(body);
  }

  /**
   * File Detail API 오류 핸들러
   * @private
   */
  function _onErrorFileDetail() {
    $scope.hasFileAPIError = true;
    $state.go('messages.detail.files.item', $state.params);
  }

  /**
   * File Detail API 성공 핸들러
   * @param {object} response
   * @private
   */
  function _onSuccessFileDetail(response) {
    var messageDetails = response && response.messageDetails;
    var i = messageDetails && messageDetails.length - 1 || 0;
    var item;

    // 일단 polling이 없으니 업데이트가 있을때마다 새로 갱신
    $scope.file_comments = [];

    //데이터가 시간 역순으로 정렬되어 있으므로, 뒤에서부터 순회한다.
    for (; i >= 0; i--) {
      item = messageDetails[i];
      _setFileDetail(item);
    }

    if ($scope.file_detail) {
      // isStarred
      $scope.isStarred = $scope.file_detail.isStarred;

      if ($scope.file_detail.content) {
        // preview image url 생성
        setImageUrl($scope.file_detail.content);
      }

      // writer
      $scope.file_detail.extWriter = EntityMapManager.get('member', $scope.file_detail.writerId);

      // integrate file
      $scope.isIntegrateFile = fileAPIservice.isIntegrateFile($scope.file_detail.content.serverUrl); // integrate file 여부
    }

    if (!$scope.initialLoaded) {
      $scope.initialLoaded = true;
    }
  }

  /**
   * $scope 에 전달받은 data 를 토데로 file 상세 정보를 설정한다.
   * @param {object} item 전달받은 데이터
   * @private
   */
  function _setFileDetail(item) {
    if (item.contentType === 'file') {
      // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
      $scope.file_detail = item;
      _addExtraData($scope.file_detail, item.writerId);

      $scope.file_detail.shared = fileAPIservice.updateShared(item);
      $scope.hasTopic = !!$scope.file_detail.shared.length;
      $scope.isFileArchived = _isFileArchived($scope.file_detail);
    } else if (!_isFileArchived(item)) {
      _appendFileComment(item);
    }
  }

  /**
   * Object에 추가 데이터를 가공하여 덧붙인다.
   * @param {object} target - 덧붙일 대상 object
   * @param {number|string} writerId - 작성자 ID
   * @private
   */
  function _addExtraData(target, writerId) {
    var writer = entityAPIservice.getEntityById('user', writerId);
    if (_.isObject(target)) {
      target.extWriter = writer;
      target.extWriterName = $filter('getName')(writer);
      target.extProfileImg = $filter('getSmallThumbnail')(writerId);
    }
  }
  /**
   * file comment 를 포멧에 맞춰 가공 후 추가한다.
   * @param {object} item
   * @private
   */
  function _appendFileComment(item) {
    var contentType = item.contentType;
    if (contentType === 'comment' || contentType === 'comment_sticker') {
      if (item.content && item.content.body) {
        item.content.body = _getSafeBody(item);
      }
      item.isSticker = (contentType === 'comment_sticker');
      _addExtraData(item, item.writerId);
      $scope.file_comments.push(item);
    }
  }

  /**
   * 삭제 상태인지 확인한다.
   * @param {object} file
   * @returns {boolean}
   * @private
   */
  function _isFileArchived(file) {
    return file.status == 'archived';
  }

  /**
   * 삭제 성공시 이벤트 핸들러
   * @private
   */
  function _onSuccessDelete() {
    $scope.glued = true;
    getFileDetail();
  }

  /**
   * 삭제 실패시 이벤트 핸들러
   * @param {object} err
   * @param {string} referrer
   * @private
   */
  function _onErrorDelete(err, referrer) {
    $state.go('error', {code: err.code, msg: err.msg, referrer: referrer});
  }

  /**
   * 현재 file detail tab 을 보고있는지 안 보고있는지 알려준다.
   * @returns {boolean} true - file deatil tab 을 보고 있을 경우
   * @private
   */
  function _isFileDetailActive() {
    // file detail을 보고 있지 않는 경우에는 무시
    return fileId && $state.params.itemId != null && $state.params.itemId !== '';
  }

  /**
   * Redirect user back to file list.
   */
  function backToFileList() {
    $state.go('messages.detail.' + (RouterHelper.getRightPanelTail() || 'files'));
  }

  function onFileDetailImageLoad() {
    $scope.isLoadingImage = false;
  }

  /**
   * comment가 작성된 날짜 get
   * @param {number} index - current index
   * @param {object} comment - current comment
   * @returns {string} comment 작성 날짜
   */
  function getCreateTime(index, comment) {
    var fileComments = $scope.file_comments;
    var prevComment;
    var createTime;

    comment.exCreateTime = new Date(comment.createTime);
    prevComment = fileComments[index - 1];
    if (!prevComment ||
      prevComment.exCreateTime.getYear() !== comment.exCreateTime.getYear() ||
      prevComment.exCreateTime.getMonth() !== comment.exCreateTime.getMonth() ||
      prevComment.exCreateTime.getDate() !== comment.exCreateTime.getDate()) {
      createTime = $filter('getyyyyMMddformat')(comment.createTime);
    } else {
      createTime = $filter('date')(comment.createTime, 'h:mm a');
    }

    return createTime;
  }

  /**
   * file_detail이 변경되면 mentionList 갱신
   * @param {object} $mentionScope
   */
  function watchFileDetail($mentionScope, $mentionCtrl) {
    var currentMemberId = memberService.getMemberId();

    // file_detail 변경시 마다 mention list 변경
    $scope.$watch('file_detail', function(value) {
      var sharedEntities;
      var entity;
      var members;
      var member;
      var i;
      var iLen;
      var j;
      var jLen

      var mentionList = [];

      if (value) {
        sharedEntities = value.shareEntities;
        for (i = 0, iLen = sharedEntities.length; i < iLen; i++) {
          entity = entityAPIservice.getEntityFromListById($scope.totalEntities, sharedEntities[i]);
          if (entity && /channels|privategroups/.test(entity.type)) {
            members = entityAPIservice.getMemberList(entity);
            if (members) {
              for (j = 0, jLen = members.length; j < jLen; j++) {
                member = entityAPIservice.getEntityFromListById($scope.totalEntities, members[j]);
                if (member && currentMemberId !== member.id && member.status === 'enabled') {
                  member.exViewName = '[@' + member.name + ']';
                  member.exSearchName = member.name;
                  mentionList.push(member);
                }
              }
            }
          }
        }

        $mentionCtrl.setMentions(_.chain(mentionList).uniq('id').sortBy('name').value());
      }
    });
  }

  /**
   * star click trigger
   */
  function onStarClick() {
    $timeout(function() {
      $('.file-detail').find('.star-btn').trigger('click');
    });
  }

  /**
   * comment 를 즐겨찾기함
   */
  function starComment(event) {
    $timeout(function() {
      $(event.target).parents('.comment-item-header__action').find('.comment-star i').trigger('click');
    });
  }
});
