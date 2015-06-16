'use strict';

var app = angular.module('jandiApp');

app.controller('fileDetailCtrl', function($scope, $rootScope, $state, $modal, $sce, $filter, $timeout, $q,
                                          fileAPIservice, entityheaderAPIservice, analyticsService, entityAPIservice,
                                          publicService, configuration, modalHelper, jndPubSub, jndKeyCode) {

  //console.info('[enter] fileDetailCtrl');
  var _sticker = null;

  var fileId = $state.params.itemId;
  //file detail에서 integraiton preview로 들어갈 image map
  var integrationPreviewMap = {
    google: 'assets/images/web_preview_google.png',
    dropbox: 'assets/images/web_preview_dropbox.png'
  };
  var noPreviewAvailableImage = 'assets/images/no_preview_available.png';

  $scope.initialLoaded    = false;
  $scope.file_detail      = null;
  $scope.file_comments    = [];
  $scope.glued            = false;
  $scope.isPostingComment = false;
  $scope.hasFileAPIError  = false;
  $scope.comment = {};
  $scope.isLoadingImage   = true;


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
  $scope.onKeyDown = onKeyDown;
  $scope.onFileDetailImageLoad = onFileDetailImageLoad;

  _init();

  /**
   * 초기화 메서드
   * @private
   */
  function _init() {
    if (!_.isUndefined(fileId)) {
      _initListeners();
      $scope.isPostingComment = false;
      getFileDetail();
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
    $scope.$on('updateFileDetailPanel', _onFileChanged);
    $scope.$on('setCommentFocus', _focusInput);
    $scope.$on('onChangeSticker:file',function(event, item) {
      _sticker = item;
      _focusInput();
    });

    $scope.$on('onChangeShared', function(event, data) {
      // file detail을 보고 있지 않는 경우에는 무시
      if (fileId && $state.params.itemId != null && $state.params.itemId !== '') {
        if ($scope.file_detail.shareEntities.length === 1 && data && data.type === 'delete' && $scope.file_detail.shareEntities[0] === data.id) {
          // 공유된 곳이 한곳이고 delete event
          $scope.hasTopic = false;
        } else {
          getFileDetail();
        }
      }
    });

    // share된 곳이 없는 file일 경우에도 file_detail 갱신 하도록 함.
    $scope.$on('rightFileDetailOnFileCommentCreated', function(event, param) {
      if ($scope.file_detail && $scope.file_detail.shareEntities.length === 0) {
        _onFileChanged(event, param);
      }
    });
  }

  /**
   * file 상세정보를 조회한다.
   * @returns {*}
   */
  function getFileDetail() {
    var deferred = $q.defer();
    if (!$scope.fileLoadStatus.loading) {
      $scope.fileLoadStatus.loading = true;
      $timeout(function() {
        fileAPIservice.getFileDetail(fileId)
          .success(_onSuccessFileDetail)
          .error(_onErrorFileDetail);
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
    var content = $scope.comment && $scope.comment.content;
    if (!$scope.isPostingComment &&
      ((content) || _sticker)) {
      _hideSticker();

      $scope.isPostingComment = true;

      fileAPIservice.postComment(fileId, content, _sticker)
        .success(function(response) {
          $scope.glued = true;
          $scope.comment.content = "";
          $scope.focusPostComment = true;
        })
        .error(function(err) {
        })
        .finally(function() {
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
   * @param keyDownEvent
   */
  function onKeyDown(keyDownEvent) {
    if (jndKeyCode.match('ESC', keyDownEvent.keyCode)) {
      _hideSticker();
    }
  }

  /**
   * user 이미지 클릭시 이벤트 핸들러
   * @param {object} user
   */
  function onUserClick(user) {
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
  function setImageUrl(fileDetail) {
    var content = fileDetail.content;
    var integrationImage;

    // file detail에서 preview image 설정
    if ($filter('hasPreview')(content)) {
      $scope.ImageUrl = $scope.server_uploaded + content.fileUrl;
    } else {
      if (integrationImage = integrationPreviewMap[content.serverUrl]) {
        $scope.ImageUrl = configuration.assets_url + integrationImage;
      } else {
        $scope.ImageUrl = configuration.assets_url + noPreviewAvailableImage;
      }
      $scope.cursor = 'pointer';
    }
  }

  /**
   * 이미지 클릭시 이벤트 핸들러
   */
  function onImageClick() {
    var content = $scope.file_detail.content;
    if (integrationPreviewMap[content.serverUrl]) {
      window.open(content.fileUrl, '_blank');
    } else {
      modalHelper.openFullScreenImageModal($scope, $scope.ImageUrl);

      //$modal.open({
      //  scope       :   $scope,
      //  controller  :   'fullImageCtrl',
      //  templateUrl :   'app/modal/fullimage.html',
      //  windowClass :   'modal-full fade-only',
      //  resolve     :   {
      //    photoUrl    : function() {
      //      return $scope.ImageUrl;
      //    }
      //  }
      //});
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
      "category"      : file_meta[0],
      "extension"     : file.content.ext,
      "mime type"     : file.content.type,
      "size"          : file.content.size
    };
    analyticsService.mixpanelTrack( "File Download", download_data );
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

      // If 'targetEntity' is defined, it means I had it on my 'joinedEntities'.  So just go!
      if (angular.isDefined(targetEntity)) {
        $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
      }
      else {
        // Undefined targetEntity means it's an entity that I'm joined.
        // Join topic first and go!
        entityheaderAPIservice.joinChannel(entityId)
          .success(function(response) {
            analyticsService.mixpanelTrack( "topic Join" );
            $rootScope.$emit('updateLeftPanelCaller');
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
  function onFileDeleteClick(fileId) {
    if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
      return;
    }

    fileAPIservice.deleteFile(fileId)
      .success(function(response) {
        getFileDetail();
        $rootScope.$broadcast('onFileDeleted', fileId);
      })
      .error(function(err) {
        console.log(err);
      });
  }

  /**
   * 비활성 사용자인지 여부 반환
   * @param {object} member
   * @returns {*}
   */
  function isDisabledMember(member) {
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
      if (parseInt(fileId) === deletedFileId) {
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
    jndPubSub.pub('deselectSticker:file');
  }

  /**
   * safeBody 를 반환한다.
   * @param {String} body
   * @returns {*}
   * @private
   */
  function _getSafeBody(body) {
    if (body) {
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

    $state.go('messages.detail.files.item', $state.params);

    if (!$scope.initialLoaded) {
      $scope.initialLoaded = true;
    }
    if ($scope.file_detail) {
      if ($scope.file_detail.content && /image/i.test($scope.file_detail.content.type)) {
        // preview image url 생성
        setImageUrl($scope.file_detail);
      }

      $scope.isIntegrateFile  = fileAPIservice.isIntegrateFile($scope.file_detail.content.serverUrl); // integrate file 여부
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

      $scope.hasTopic = !!$scope.file_detail.shareEntities.length;

      $scope.file_detail.shared = fileAPIservice.getSharedEntities(item);
      $scope.isFileArchived = _isFileArchived($scope.file_detail);
    } else if (!_isFileArchived(item)) {
      if (item.contentType === 'comment') {
        item.content.body = _getSafeBody(item.content.body);
        item.isSticker = false;
        $scope.file_comments.push(item);
      } else if (item.contentType === 'comment_sticker') {
        item.isSticker = true;
        $scope.file_comments.push(item);
      }
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
   * ?? 잘 모르겠음
   * @returns {boolean}
   * @private
   */
  function _isFileDetailActive() {
    return !!fileId;
  }

  /**
   * Redirect user back to file list.
   */
  function backToFileList() {
    $state.go('messages.detail.files');
  }

  function onFileDetailImageLoad() {
    $scope.isLoadingImage = false;
  }
});
