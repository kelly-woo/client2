'use strict';

var app = angular.module('jandiApp');

app.controller('fileController', function($scope, $rootScope, $state, $modal, $sce, $filter, $timeout, $q, fileAPIservice, entityheaderAPIservice, analyticsService) {

    //console.info('[enter] fileController');

    var fileId = $state.params.itemId;

    if (_.isUndefined(fileId)) return;

    $scope.initialLoaded    = false;
    $scope.file_detail      = null;
    $scope.file_comments    = [];
    $scope.glued            = false;

    // configuration for message loading
    $scope.fileLoadStatus = {
        loading: false
    };

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
                                    safeBody = $filter('parseUrl')(safeBody);
                                    //item.content.body = safeBody.replace(/\n/g, '<br>');
                                 }
                                item.content.body = $sce.trustAsHtml(safeBody);
                                $scope.file_comments.push(item);
                            }
                        }

                        $state.go('messages.detail.files.item', $state.params);

                        if (!$scope.initialLoaded) $scope.initialLoaded = true;

                    })
                    .error(function(err) {
                        console.error(err.msg);
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
    getFileDetail();

    $scope.postComment = function() {
        if (!$scope.comment || !$scope.comment.content) return;

        fileAPIservice.postComment(fileId, $scope.comment.content)
            .success(function(response) {
//                console.log("fileAPIservice.postComment.success", response);
                $scope.glued = true;
                getFileDetail();
                $scope.comment.content = "";
                $scope.focusPostComment = true;
            })
            .error(function(err) {
                $state.go('error', {code: err.code, msg: err.msg, referrer: "fileAPIservice.postComment"});
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

    $scope.onImageClick = function() {
        $modal.open({
            scope       :   $scope,
            controller  :   'fullImageCtrl',
            templateUrl :   'app/modal/fullimage.html',
            windowClass :   'modal-full fade-only',
            resolve     :   {
                photoUrl    : function() {
                    return $scope.server_uploaded + $scope.file_detail.content.fileUrl;
                }
            }
        });
    };

    $scope.openModal = function(selector) {
        if (selector == 'share') {
            $modal.open({
                scope       : $scope,
                templateUrl : 'app/modal/share.html',
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
        var targetEntity = fileAPIservice.getEntityById($scope.totalEntities, entityId);
        if (fileAPIservice.isMember(targetEntity, $scope.user)) {
            $state.go('archives', { entityType: targetEntity.type + 's', entityId: targetEntity.id });
        } else {
            entityheaderAPIservice.joinChannel(targetEntity.id)
                .success(function(response) {
                    analyticsService.mixpanelTrack( "topic Join" );
                    $rootScope.$emit('updateLeftPanelCaller');
                    $state.go('archives', {entityType:targetEntity.type + 's',  entityId:targetEntity.id});
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

});

app.controller('fullImageCtrl', function($scope, $modalInstance, photoUrl) {
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
    }
});