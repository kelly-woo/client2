'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal, entityheaderAPIservice, messageAPIservice, fileAPIservice) {

    console.info('[enter] centerpanelController');

    var entityType = $state.params.entityType;
    var entityId = $state.params.entityId;

    $scope.entityId = entityId;
    $scope.entityType = entityType;
    $scope.messages = [];

    // configuration for message loading
    $scope.msgLoadStatus = {
        loading: false,
        loaded: false,
        firstLoadedId: -1,
        lastUpdatedId: -1,
        isFirst: false
    };

    var groupByDate = function() {
        // 중복 메세지 제거 (TODO 매번 모든 리스트를 다 돌리는게 비효율적이지만 일단...)
        $scope.messages = _.uniq($scope.messages);

        for (var i in $scope.messages) {
            var msg = $scope.messages[i];
            var prev = (i == 0) ? null : $scope.messages[i-1];
            // comment continuous check
            if ( msg.message.contentType === 'comment' ) {
                msg.message.commentOption = { isTitle: false, isContinue: false };
                if ( i == 0 ) {
                    msg.message.commentOption.isTitle = true;
                } else {
                    // TODO 이전 메세지와 feedbackId가 같은지도 체크 필요함
                    if (prev.message.contentType === 'file') {

                        // 파일 아래 바로 해당 파일의 코멘트
                        if (prev.messageId === msg.feedbackId) {
                            msg.message.commentOption.isContinue = true;
                        } else {
                            msg.message.commentOption.isTitle = true;
                        }

                    } else if (prev.message.contentType === 'comment') {

                        // 같은 파일에 대한 연속 코멘트
                        if (prev.feedbackId === msg.feedbackId) {
                            msg.message.commentOption.isContinue = true;
                        } else {
                            msg.message.commentOption.isTitle = true;
                        }

                    } else {
                        msg.message.commentOption.isTitle = true;
                    }
                }
            } else if (msg.message.contentType === 'file') {
                msg.message.isFile = true;
            } else if (msg.message.contentType === 'text') {
                msg.message.isText = true;
            }

            // console.log(msg.message.contentType, msg.id);
            // console.log("");
            $scope.messages[i] = msg;
        }

        $scope.groupMsgs = [];
        $scope.groupMsgs = _.groupBy($scope.messages, function(msg) {
            return $filter('ordinalDate')(msg.time, "yyyyMMddEEEE, MMMM doo, yyyy");
        });

    };

    $scope.loadMore = function() {
        var deferred = $q.defer();

        if ($scope.msgLoadStatus.isFirst) return;

        if (!$scope.msgLoadStatus.loading) {

            $scope.msgLoadStatus.loading = true;
            // simulate an ajax request
            $timeout(function() {
                // 엔티티 메세지 리스트 목록 얻기
                messageAPIservice.getMessages(entityType, entityId, $scope.msgLoadStatus.firstLoadedId)
                    .success(function(response) {
                        if (response.messageCount) {
                            for (var i in response.messages.reverse()) {

                                var msg = response.messages[i];

                                // shared entities 가 있을 경우
                                if ( (msg.status === 'shared' || msg.status === 'unshared') && msg.message.shareEntities.length) {
                                    // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
                                    msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                                }

                                // parse HTML, URL code
                                var safeBody = msg.message.content.body;
                                if (safeBody != undefined && safeBody !== "") {
                                    safeBody = $filter('parseUrl')(safeBody);
                                }
                                msg.message.content.body = $sce.trustAsHtml(safeBody);

                                $scope.messages.unshift(msg);
                                // console.log("msg", i, msg);
                            }
                            groupByDate();
                        }

                        // 최초 로드시 max(linkId) 업데이트
                        if ( $scope.msgLoadStatus.firstLoadedId < 0 && response.messageCount ) {
                            $scope.msgLoadStatus.lastUpdatedId = _.max($scope.messages, function(message) {
                                return message.id;
                            }).id;
                        }

                        // 추후 로딩을 위한 status 설정
                        $scope.msgLoadStatus.firstLoadedId = response.firstIdOfReceviedList;
                        $scope.msgLoadStatus.isFirst = response.isFirst;
                        $scope.msgLoadStatus.loading = false;
                        $scope.msgLoadStatus.loaded = ($scope.messages.length > 0);

                        // auto focus to textarea
                        $scope.focusPostMessage = true;

                    })
                    .error(function(response) {
                        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.getMessages"});
                    });

                deferred.resolve();
            }, 1500);
        } else {
            deferred.reject();
        }
        return deferred.promise;
    };
    $scope.loadMore();

    // 주기적으로 업데이트 메세지 리스트 얻기 (polling)
    // TODO: [건의사항] 웹에서는 polling 보다는 websocket이 더 효과적일듯
    $scope.promise = null;
    var updateList = function() {
        messageAPIservice.getUpdatedMessages(entityType, entityId, $scope.msgLoadStatus.lastUpdatedId)
            .success(function (response) {
                if (response.messageCount) {

                    // lastUpdatedId 갱신
                    $scope.msgLoadStatus.lastUpdatedId = _.max(response.messages, function(message) {
                        return message.id;
                    }).id;

                    // 업데이트 된 메세지 처리
                    for (var i in response.messages) {
                        var msg = response.messages[i];
                        console.log("[ updated", msg.status, "]", msg);

                        // auto focus to textarea
                        $scope.focusPostMessage = true;

                        // parse HTML, URL code
                        var safeBody = msg.message.content.body;
                        if (safeBody != undefined && safeBody !== "") {
                            safeBody = $filter('parseUrl')(safeBody);
                        }
                        msg.message.content.body = $sce.trustAsHtml(safeBody);

                        switch (msg.status) {
                            case 'created':
                                $scope.messages.push(msg);
                                break;
                            case 'edited':
                                var target = _.find($scope.messages, function(m) {
                                    return m.messageId === msg.messageId;
                                });
                                if (!_.isUndefined(target)) {
                                    var targetIdx = $scope.messages.indexOf(target);
                                    $scope.messages.splice(targetIdx, 1);
                                    $scope.messages.push(msg);
                                }
                                break;
                            case 'archived':
                                var target = _.find($scope.messages, function(m) {
                                    return m.messageId === msg.messageId;
                                });
                                if (!_.isUndefined(target)) {
                                    var targetIdx = $scope.messages.indexOf(target);
                                    $scope.messages.splice(targetIdx, 1);
                                }
                                break;
                            case 'shared':
                                msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                                $scope.messages.push(msg);
                                break;
                            case 'unshared':
                                var target = _.find($scope.messages.reverse(), function(m) {
                                    return m.messageId === msg.messageId;
                                });
                                if (!_.isUndefined(target)) {
                                    // 기존 shared message 제거
                                    var targetIdx = $scope.messages.indexOf(target);
                                    $scope.messages.splice(targetIdx, 1);
                                    // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
                                    msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                                    $scope.messages.push(msg);
                                }
                                break;
                            default:
                                console.error("!!! unfiltered message", msg);
                                break;
                        }
                    }

                    groupByDate();
                }

            })
            .error(function (response) {
                // change state to ERROR with response
                $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.getUpdatedMessages"});
            });

        // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
        $scope.promise = $timeout(updateList, 3000);
    };
    $scope.promise = $timeout(updateList, 3000);

    // scope 소멸시(전환시) update polling 해제
    $scope.$on('$destroy', function(){
        $timeout.cancel($scope.promise);
    });

    $scope.message = {};
    $scope.postMessage = function() {
        if (!$scope.message.content) return;

        // prevent duplicate request
        $scope.msgLoadStatus.loading = true;
        var msg = $scope.message.content;
        $scope.message.content = "";

        messageAPIservice.postMessage(entityType, entityId, {'content': msg})
            .success(function(response) {
                $scope.msgLoadStatus.loading = false;
                $timeout.cancel($scope.promise);
                updateList();
            })
            .error(function(response) {
                $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.postMessage"});
            });
    };

    $scope.editMessage = function(messageId, updateContent) {
        if (updateContent === "") return "";

        var message = {"content": updateContent};
        messageAPIservice.editMessage(entityType, entityId, messageId, message)
            .success(function(response) {
                $timeout.cancel($scope.promise);
                updateList();
            })
            .error(function(response) {
                $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.editMessage"});
            });
    };

    $scope.deleteMessage = function(message) {
        console.log("delete: ", message.messageId);
        messageAPIservice.deleteMessage(entityType, entityId, message.messageId)
            .success(function(response) {
                $timeout.cancel($scope.promise);
                updateList();
            })
            .error(function(response) {
                $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.deleteMessage"});
            });
    };


    // Callback function from file finder(navigation) for uploading a file.
    $scope.onFileSelect = function($files) {
        $scope.selectedFiles = $files;
        $scope.dataUrls = [];
        for ( var i = 0; i < $files.length; i++) {
            var file = $files[i];
            if (window.FileReader && file.type.indexOf('image') > -1) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                var loadFile = function(fileReader, index) {
                    fileReader.onload = function(e) {
                        $timeout(function() {
                            $scope.dataUrls[index] = e.target.result;
                        });
                    }
                }(fileReader, i);
            }
        }
        this.openModal('file');
    };

    $scope.openModal = function(selector) {
        // OPENING JOIN MODAL VIEW
        if (selector == 'file') {
            $modal.open({
                scope       : $scope,
                templateUrl : 'app/modal/upload.html',
                controller  : fileUploadModalCtrl,
                size        : 'lg'
            });
        }
    };


    /*
     *  $scope.messages 중 shared entity 변화가 일어난 경우 추가/삭제 처리
     */
    $scope.$on('onChangeShared', function(event, data) {
        // 파일업로드인 경우엔 어차피 polling시 패널을 갱신하기 때문에 예외 처리
        if (_.isNull(data)) return;
        // share / unshare 경우
        _.each($scope.messages, function(msg) {
            if (msg.messageId === data.messageId) {
                // TODO 변경된 shareEntities를 얻기 위해 일단 파일 상세정보를 모두 가져옴
                fileAPIservice.getFileDetail(msg.messageId).success(function(response) {
                    for (var i in response.messageDetails) {
                        var item = response.messageDetails[i];
                        if (item.contentType === 'file') {
                            msg.message.shared = fileAPIservice.getSharedEntities(item);
                        }
                    }
                });
            }
        });
    });

    // TODO rightpanelController 로직 중복 해결 필요
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

    $scope.onClickUnshare = function(messageId, entityId) {
        fileAPIservice.unShareEntity(messageId, entityId)
            .success(function(response) {
                fileAPIservice.broadcastChangeShared(messageId);
            })
            .error(function(err) {
                alert(err.msg);
            });
    };

});
