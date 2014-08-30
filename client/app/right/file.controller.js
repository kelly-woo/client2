'use strict';

var app = angular.module('jandiApp');

app.controller('fileController', function($scope, $rootScope, $state, $modal, $sce, $filter, $timeout, $q, fileAPIservice, entityheaderAPIservice) {

    console.info('[enter] fileController');

    var fileId = $state.params.itemId;

    if (_.isUndefined(fileId)) return;

    $scope.file_detail = null;
    $scope.file_comments = [];
    $scope.glued = false;

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

                    })
                    .error(function(err) {
                        console.error(err.msg);
                    });

                $scope.fileLoadStatus.loading = false;

                deferred.resolve();
            }, 0);
        } else {
            deferred.reject();
        }

        return deferred.promise;
    }
    getFileDetail();

    $scope.postComment = function() {
        if (!$scope.comment.content) return;

        fileAPIservice.postComment(fileId, $scope.comment.content)
            .success(function(response) {
                console.log("fileAPIservice.postComment.success", response);
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
                console.log("fileAPIservice.deleteComment.success", response);
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
            windowClass :   'modal-full'
        });
    };

    $scope.isToggled = false;
    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.isToggled = !$scope.isToggled;
    };

    $scope.openModal = function(selector) {
        if (selector == 'share') {
            $modal.open({
                scope       : $scope,
                templateUrl : 'app/modal/share.html',
                controller  : fileShareModalCtrl,
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

    $scope.onClickShare = function(file) {
        $scope.fileToShare = file;
        this.openModal('share');
    };
    $scope.onClickUnshare = function(messageId, entityId) {
        fileAPIservice.unShareEntity(messageId, entityId)
            .success(function(response) {
                fileAPIservice.broadcastChangeShared(messageId);
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

});

app.controller('fullImageCtrl', function($scope, $modalInstance) {
    $scope.cancel = function() { $modalInstance.dismiss('cancel');}
});

//var fullImageCtrl = function($scope, $modalInstance) {
//    $scope.cancel = function() { $modalInstance.dismiss('cancel');}
//};
