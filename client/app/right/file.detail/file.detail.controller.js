'use strict';

var app = angular.module('jandiApp');

app.controller('fileDetailCtrl', function($scope, $rootScope, $state, $modal, $sce, $filter, $timeout, $q, fileAPIservice, entityheaderAPIservice, analyticsService, entityAPIservice, publicService, configuration) {

  //console.info('[enter] fileDetailCtrl');

  var fileId = $state.params.itemId;
  if (_.isUndefined(fileId)) return;

  $scope.initialLoaded    = false;
  $scope.file_detail      = null;
  $scope.file_comments    = [];
  $scope.glued            = false;
  $scope.isPostingComment = false;
  $scope.hasFileAPIError  = false;

  // configuration for message loading
  $scope.fileLoadStatus = {
    loading: false
  };

  $scope.$on('updateRightFileDetailPanel', function() {
    _init();
  });

  $scope.$on('rightFileDetailOnFileDeleted', function(event, param) {
    _onFileChanged(param);
  });

  // share된 곳이 없는 file일 경우에도 file_detail 갱신 하도록 함.
  $scope.$on('rightFileDetailOnFileCommentCreated', function(event, param) {
    $scope.file_detail && $scope.file_detail.shareEntities.length === 0 && _onFileChanged(param);
  });

  $scope.$on('rightFileDetailOnFileCommentDeleted', function(event, param) {
    _onFileChanged(param);
  });

  $scope.$on('updateFileDetailPanel', function(event, param) {
    _onFileChanged(param);
  });

  function _onFileChanged(param) {
    if (_isFileDetailActive()) {
      var deletedFileId = param.file.id;
      if (parseInt(fileId) === deletedFileId) {
        getFileDetail();
      }
    }
  }

  (function() {
    _init();
  })();

  function _init() {
    $scope.isPostingComment = false;
    getFileDetail();
  }

  function getFileDetail() {
    var deferred = $q.defer();
    if (!$scope.fileLoadStatus.loading) {
      $scope.fileLoadStatus.loading = true;
      $timeout(function() {
        fileAPIservice.getFileDetail(fileId)
          .success(function(response) {
            // 일단 polling이 없으니 업데이트가 있을때마다 새로 갱신
            $scope.file_comments = [];
            for (var i in response.messageDetails) {
              var item = response.messageDetails[i];
              if (item.contentType === 'file') {
                $scope.file_detail = item;

                // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
                $scope.file_detail.shared = fileAPIservice.getSharedEntities(item);
              } else if (item.contentType === 'comment') {
                if (item.status === 'archived') continue;
                var safeBody = item.content.body;
                if (safeBody != undefined && safeBody !== "") {
                  safeBody = $filter('parseAnchor')(safeBody);
                  //item.content.body = safeBody.replace(/\n/g, '<br>');
                }
                item.content.body = $sce.trustAsHtml(safeBody);
                $scope.file_comments.push(item);
              }
            }

            $state.go('messages.detail.files.item', $state.params);

            if (!$scope.initialLoaded) $scope.initialLoaded = true;

            $scope.isFileArchived = isFileArchived($scope.file_detail);

            if ($scope.file_detail) {
              setImageUrl($scope.file_detail);    // preview image url 생성
              $scope.isIntegrateFile  = fileAPIservice.isIntegrateFile($scope.file_detail.content.serverUrl); // integrate file 여부
            }
            //console.log($scope.file_detail)
            //console.log('is deleted file?', $scope.isFileArchived)
          })
          .error(function(err) {
            $scope.hasFileAPIError = true;
            $state.go('messages.detail.files.item', $state.params);
          })
          .finally(function() {

          });


        $scope.fileLoadStatus.loading = false;
        $('.file-detail-body').addClass('opac_in');

        deferred.resolve();
      }, 0);
    } else {
      deferred.reject();
    }

    return deferred.promise;
  }


  function isFileArchived(file) {
    return file.status == 'archived';
  }

  $scope.postComment = function() {
    if (!$scope.comment || !$scope.comment.content) return;

    if ($scope.isPostingComment) return;

    $scope.isPostingComment = true;

    fileAPIservice.postComment(fileId, $scope.comment.content)
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
  };

  $scope.deleteComment = function(commentId) {
    fileAPIservice.deleteComment(fileId, commentId)
      .success(function(response) {
        //console.log("fileAPIservice.deleteComment.success", response);
        $scope.glued = true;
        getFileDetail();
      })
      .error(function(err) {
        $state.go('error', {code: err.code, msg: err.msg, referrer: "fileAPIservice.deleteComment"});
      });
  };

  /**
   * file detail에서 integraiton preview로 들어갈 image map
   */
  var integrationPreviewMap = {
    google: 'assets/images/web_preview_google.png',
    dropbox: 'assets/images/web_preview_dropbox.png'
  };
  /**
   * file detail에서 preview 공간에 들어갈 image의 url을 설정함
   */
  function setImageUrl(fileDetail) {
    var content = fileDetail.content;

    // file detail에서 preview image 설정
    if ($filter('hasPreview')(content)) {
      $scope.ImageUrl = $scope.server_uploaded + content.extraInfo.largeThumbnailUrl;
    } else {
      $scope.ImageUrl = (integrationPreviewMap[content.serverUrl] && (configuration.assets_url + integrationPreviewMap[content.serverUrl]));
      $scope.cursor = 'pointer';
    }
  }

  $scope.onImageClick = function() {
    var content = $scope.file_detail.content;
    if (integrationPreviewMap[content.serverUrl]) {
      var win = window.open(content.fileUrl, '_blank');
    } else {
      $modal.open({
        scope       :   $scope,
        controller  :   'fullImageCtrl',
        templateUrl :   'app/modal/fullimage.html',
        windowClass :   'modal-full fade-only',
        resolve     :   {
          photoUrl    : function() {
            return $scope.ImageUrl;
          }
        }
      });
    }
  };

  $scope.openModal = function(selector) {
    if (selector == 'share') {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/share/share.html',
        controller  : 'fileShareModalCtrl',
        size        : 'lg',
        resolve: {
          parameters: function () {
            return {
              fileToShare :   $scope.fileToShare
            };
          }
        }
      });
    }
  };

  $scope.onClickDownload = function(file) {
    // analytics
    var file_meta = (file.content.type).split("/");
    var download_data = {
      "category"      : file_meta[0],
      "extension"     : file.content.ext,
      "mime type"     : file.content.type,
      "size"          : file.content.size
    };
    analyticsService.mixpanelTrack( "File Download", download_data );
  };

  $scope.onClickShare = function(file) {
    $scope.fileToShare = file;
    this.openModal('share');
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

        fileAPIservice.broadcastChangeShared(message.id);
      })
      .error(function(err) {
        alert(err.msg);
      });
  };
  $scope.onClickSharedEntity = function(entityId) {

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
  };

  $scope.$on('onChangeShared', function() {
    // console.debug("state.params", $state.params);
    if ($state.params.itemId) {
      getFileDetail();
    } else {
      // 파일리스트 뷰를 보고 있는 경우엔 업데이트 무시
    }
  });

  $scope.onUserClick = function(user) {
    $scope.$emit('onUserClick', user);
  };

  $scope.onCommentFocusClick = function() {
    $('#file-detail-comment-input').focus();
  };

  $scope.$on('setCommentFocus', function() {
    $scope.onCommentFocusClick();
  });

  $scope.onFileDeleteClick = function(fileId) {
    if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
      return;
    }

    fileAPIservice.deleteFile(fileId)
      .success(function(response) {
        getFileDetail();
        //$state.go('messages.detail.files');

        $rootScope.$broadcast('onFileDeleted', fileId);
      })
      .error(function(err) {
        console.log(err);
      })
      .finally(function() {

      });
  };

  $scope.isDisabledMember = function(member) {
    return publicService.isDisabledMember(member);
  };

  function _isFileDetailActive() {
    return !!$state.params.itemId;
  }

});

app
  .controller('fullImageCtrl', function($scope, $modalInstance, photoUrl) {
    $scope.cancel = function() { $modalInstance.dismiss('cancel');}
    $scope.photoUrl = photoUrl;
    $scope.onImageRotatorClick = function($event) {

      var sender = angular.element($event.target);
      var senderID = sender.attr('id');

      var target = '';
      switch(senderID){
        case 'fromModal':
          target = sender.parent().siblings('img.image-background').parent();
          break;
        default :
          break;
      }

      if (target === '') return;
      var targetClass = target.attr('class');

      if (targetClass.indexOf('rotate-90') > -1) {
        target.removeClass('rotate-90');
        target.addClass('rotate-180');
      }
      else if(targetClass.indexOf('rotate-180') > -1) {
        target.removeClass('rotate-180');
        target.addClass('rotate-270');
      }
      else if(targetClass.indexOf('rotate-270') > -1) {
        target.removeClass('rotate-270');
      }
      else {
        target.addClass('rotate-90');
      }
    };
  });
