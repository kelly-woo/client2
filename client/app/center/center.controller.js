'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal, entityheaderAPIservice, messageAPIservice, fileAPIservice, entityAPIservice) {

    console.info('[enter] centerpanelController');

    var CURRENT_ENTITY_ARCHIVED = 2002;
    var INVALID_SECURITY_TOKEN  = 2000;

    var entityType = $state.params.entityType;
    var entityId = $state.params.entityId;

    var updateInterval = 1000;

    $scope.lastMessage = null;

    $scope.messageUpdateCount = 20;

    $scope.loadMoreCounter = 0;

    $scope.entityId = entityId;
    $scope.entityType = entityType;
    $scope.messages = [];

    // configuration for message loading
    $scope.msgLoadStatus = {
        loading: false,
        loaded: false,
        firstLoadedId: -1,
        lastUpdatedId: -1,
        isFirst: false,
        localLastMsgId: -1,
        loadingTimer : true,
        isInitialLoadingCompleted : false
    };



    //  default loadingTimer
    $timeout(function() {
        $scope.msgLoadStatus.loadingTimer = false;
    }, 1000);

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
            $scope.messages[i] = msg;
        }


        $scope.groupMsgs = [];
        $scope.groupMsgs = _.groupBy($scope.messages, function(msg) {
            return $filter('ordinalDate')(msg.time, "yyyyMMddEEEE, MMMM doo, yyyy");
        });
    };

    var prev = null;

    $scope.updateScroll = function(lastMessage) {

        disableScroll();

        if (prev != null){
            prev.removeClass('last');
        }

        if (lastMessage.position().top > 0) {
            lastMessage.addClass('last');
            $('.msgs').scrollTop(lastMessage.position().top - 13);
        }

        prev = lastMessage;

        $timeout(function() {
            prev.removeClass('last');
            enableScroll();
        }, 800)
    };

    function disableScroll() {
        $('body').bind('mousewheel', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    function enableScroll() {
        $('body').unbind('mousewheel');
    }

    $scope.loadMore = function() {
        var deferred = $q.defer();

        if ($scope.msgLoadStatus.isFirst) return;

        if (!$scope.msgLoadStatus.loading) {

            $scope.msgLoadStatus.loading = true;

            // simulate an ajax request
            $timeout(function() {
                // 엔티티 메세지 리스트 목록 얻기
                messageAPIservice.getMessages(entityType, entityId, $scope.msgLoadStatus.firstLoadedId, $scope.messageUpdateCount)
                    .success(function(response) {
                        //  lastUpdatedId 갱신
                        $scope.msgLoadStatus.lastUpdatedId = response.lastLinkId;

                        if (response.messageCount) {

                            for (var i in response.messages.reverse()) {

                                var msg = response.messages[i];

                                // jihoon
                                if (msg.status == 'event') {
                                    msg = eventMsgHandler(msg);
                                    $scope.messages.unshift(msg);
                                    continue;
                                }

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

                            $scope.messageUpdateCount = response.messageCount;

                            groupByDate();
                        }

                        // 최초 로드시 max(linkId) 업데이트
                        if ( $scope.msgLoadStatus.firstLoadedId < 0 && response.messageCount ) {
                            //  localLastMsgId is for message marker of current entity
                            $scope.msgLoadStatus.localLastMsgId = _.max($scope.messages, function(message) {
                                return message.id;
                            }).id;
                        }

                        // 추후 로딩을 위한 status 설정
                        $scope.msgLoadStatus.firstLoadedId = response.firstIdOfReceivedList;
                        $scope.msgLoadStatus.isFirst = response.isFirst;
                        $scope.msgLoadStatus.loading = false;
                        $scope.msgLoadStatus.loaded = ($scope.messages.length > 0);

                        // auto focus to textarea
                        $scope.focusPostMessage = true;
                        $scope.loadMoreCounter++;
                    })
                    .error(function(response) {
                        onHttpRequestError(response);
                    });
                deferred.resolve();
            });
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
        //  when 'updateList' gets called, there may be a situation where 'getMessages' is still in progress.
        //  In such case, don't update list and just return it.
        if ($scope.msgLoadStatus.loading) {
            $scope.promise = $timeout(updateList, updateInterval);
            return;
        }

        //  if code gets to this point, 'getMessages' has been done at least once.
        $scope.msgLoadStatus.isInitialLoadingCompleted = true;


        messageAPIservice.getUpdatedMessages(entityType, entityId, $scope.msgLoadStatus.lastUpdatedId)
            .success(function (response) {
                // jihoon
                if (response.alarm.alarmCount != 0) updateAlarmHandler(response.alarm);
                if (response.event.eventCount != 0) updateEventHandler(response.event);

                // lastUpdatedId 갱신
                $scope.msgLoadStatus.lastUpdatedId = response.lastLinkId;

                response = response.updateInfo;

                //  localLastMsgId is for message marker for current entity
                if (response.messageCount) {
                    $scope.msgLoadStatus.localLastMsgId = _.max(response.messages, function(message) {
                        return message.id;
                    }).id;

                    // 업데이트 된 메세지 처리
                    for (var i in response.messages) {
                        var msg = response.messages[i];
//                        console.log("[ updated", msg.status, "]", msg);

                        // auto focus to textarea
                        $scope.focusPostMessage = true;

                        if ( msg.status == 'event' ) {
                            msg = eventMsgHandler(msg);

                            $scope.messages.push(msg);
                            continue;
                        }
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

                    $scope.messageUpdateCount = response.messageCount;

                    groupByDate();
                }

            })
            .error(function (response) {
                onHttpRequestError(response);
            });

        // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
        $scope.promise = $timeout(updateList, updateInterval);
    };

    $scope.promise = $timeout(updateList, updateInterval);

    // scope 소멸시(전환시) update polling 해제
    $scope.$on('$destroy', function(){
        $timeout.cancel($scope.promise);
    });

    //  update message marker only there are new msgs to display. otherwise, don't update.
    $scope.$watch('msgLoadStatus.localLastMsgId', function(newVal, oldVal) {
        if (newVal != -1) updateMessageMarker();
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
                controller  : 'fileUploadModalCtrl',
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


    //  'event' field if not empty when,
    //      1. create channel
    //      2. leave channel
    //      3. archive(delete) channel
    //      4. invite someone to channel
    function updateEventHandler(event) {
        if (event.eventCount == 0) return;

        var eventTable = event.eventTable;

        //  true, if left panel must be updated.
        //  otherwise, false.
        var mustUpdateLeftPanel = false;

//        console.log('There are some system events');
//        console.log('There are ' + event.eventCount)
//        console.log(eventTable);

        _.find(eventTable, function(event, index, list) {
//            console.log(event);
            if (event.info.eventType == 'invite') {
                //  'INVITE' event.
                //  ASSUMPTION 1. YOU CAN ONLY INVITE TO ONE CHANNEL. -> toEntity can have only one element.
                //  ASSUMPTION 2. YOU CAN'T INVITE SOMEONE TO DIRECT MESSAGE.  -> toEntity must be id of either channel or privateGroup.

                //  someone invited 'ME' to some channel.
                if (_.contains(event.info.inviteUsers, $scope.user.id)) {
//                    console.log('someone invited me')
                    mustUpdateLeftPanel = true;
                    return;
                }

                //  I invited someone.
                //  If I invited someone on web, it doesn't really matter.
                //  But if I invited someone from different device(mobile), I need to update leftPanel on web.
                if (event.info.invitorId == $scope.user.id) {
//                    console.log('I invited someone')
                    mustUpdateLeftPanel = true;
                    return;
                }

                var updateEntity = entityAPIservice.getEntityFromListById($rootScope.joinedEntities, event.toEntity[0]);

                if (updateEntity) {
//                    console.log('someone invited someone to some channel that I am in');
                    mustUpdateLeftPanel = true;
                    return;
                }
            }
            else if (event.info.eventType == 'join' || event.info.eventType == 'leave') {
                //  'JOIN' event
                var isJoin = event.info.eventType == 'join' ? true : false;

                //  I joined some channel from mobile.  Web needs to UPDATE left Panel.
                if (event.fromEntity == $scope.user.id) {

                    //  leave event of myself cannot get here!
//                    console.log('I joined something');

                    mustUpdateLeftPanel = true;
                    return;
                }

                var updateEntity = entityAPIservice.getEntityFromListById($rootScope.joinedEntities, event.toEntity[0]);
                if (updateEntity) {
                    if (isJoin) console.log('Someone joined to related entity')
                    else console.log('Someone left related entity')

                    mustUpdateLeftPanel = true;
                    return;
                }
            }
            else if (event.info.eventType == 'create') {
                //  'CREATE' event
                //  Someone created channel 'a',
                //  I should be able to see channel 'a' as one of available channels
                //  when attempting to join other channel.
                //  No matter who created what, just update left panel.

                console.log('create')
                if (event.fromEntity == $scope.user.id) {
//                    console.log('I created channel')
                }
                else {
//                    console.log('someone created channel')
                }
                mustUpdateLeftPanel = true;
                return;
            }
            else if (event.info.eventType == 'archive') {
                //  'ARCHIVE' event
                //  ASSUMPTION 1. YOU CAN ARCHIVE ONLY ONE ENTITY AT A TIME.
                //  Same reason as 'archive' situation, just update left panel.
                //  TODO: HANDLE SITUATION WHEN SOMEONE ARCHIVED CURRENT ENTITY
                //  TODO: ERROR HANDLER WILL HANDLE ABOVE SITUATION.

                mustUpdateLeftPanel = true;

                if (event.toEntity[0] == $scope.currentEntity.id) {
//                    $timeout.cancel($scope.promise);
//
//                    console.log('someone archived current channel')
//                    $state.go('messages');
                    return;
                }
                else {
//                    console.log('someone archived some channel')
                }
                return;
            }
            else {
                console.error(event);
            }

            return mustUpdateLeftPanel;
        });

        if (mustUpdateLeftPanel) {
            $scope.$emit('updateLeftPanelCaller');
        }

    }


    //  if 'alarm' Field in response from update call is not empty,
    //  we need to handle alarm.
    //  'alarm' field is not empty when
    //      1. someone posts new messages in any other channels including 'not joined' channel.
    //      2. someone shares/comment on file.
    function updateAlarmHandler(alarm) {
        if (alarm.alarmCount == 0) return;

        var alarmTable = alarm.alarmTable;

        _.each(alarmTable, function(element, index, list) {
            //  Alarm is from me.  Don't worry about this.
            if (element.fromEntity == $scope.user.id) return;

            var updateEntity;

            //  Alarm is to me --> DIRECT MESSAGE TO ME.
            //  Updating 'fromEntity'.
            if (element.toEntity.length == 1 && element.toEntity[0] === ($scope.user.id) ) {
                //  DIRECT MESSAGE with fromEntity is already open, so DON'T WORRY ABOUT IT.
                if(element.fromEntity == $scope.currentEntity.id) return;

                updateEntity = entityAPIservice.getEntityFromListById($scope.userList, element.fromEntity);
                entityAPIservice.updateBadgeValue(updateEntity, -1);
            }
            else  {
                //  'toEntity' may be an array.
                _.each(element.toEntity, function(toEntityElement, index, list) {
                    updateEntity = entityAPIservice.getEntityFromListById($scope.joinEntities, toEntityElement);

                    //  updateEntity is archived || I don't care about updateEntity.
                    if (angular.isUndefined(updateEntity)) return;

                    //  if 'toEntity' is an entity that I'm currently looking at, Don't worry about it.
                    if (updateEntity.id == $scope.currentEntity.id) return;

                    entityAPIservice.updateBadgeValue(updateEntity, -1);
                });
            }


        });
    }

    function eventMsgHandler(msg) {
        var newMsg = msg;

        newMsg.eventType = '/' + msg.info.eventType;

        newMsg.message = {};
        newMsg.message.contentType = 'systemEvent';
        newMsg.message.content = {};
        newMsg.message.writer = msg.fromEntity;
        var action = '';

        switch(msg.info.eventType) {
            case 'invite':
                action = 'invited';
                newMsg.message.invites = [];

                _.each(msg.info.inviteUsers, function(element, index, list) {
                    var entity = entityAPIservice.getEntityFromListById($rootScope.userList, element);
                    newMsg.message.invites.push(entity)
                });
                break;
            case 'join' :
                action = 'joined this channel.';
                break;
            case 'leave' :
                action = 'left this channel.';
                break;
            case 'create' :
                action = 'created current channel at ' + $filter('date')(msg.time, 'h:mm:ss a') + '.';
                break;

        }

        newMsg.message.content.actionOwner = entityAPIservice.getFullName(msg.fromEntity);
        newMsg.message.content.body = action;

        return newMsg;
    }

    //  Updating message marker for current entity.
    function updateMessageMarker() {
        messageAPIservice.updateMessageMarker($scope.currentEntity.id, $scope.currentEntity.type, $scope.msgLoadStatus.localLastMsgId)
            .success(function(response) {
//                console.log('----------- successfully updated message marker for ' + $scope.currentEntity.id + ' to ' + $scope.msgLoadStatus.localLastMsgId + ' with ' + $scope.currentEntity.type)
            })
            .error(function(response) {
                console.log('message marker not updated for ' + $scope.currentEntity.id);
            });
    }

    function onHttpRequestError(response) {
        //  SOMEONE OR ME FROM OTHER DEVICE DELETED CURRENT ENTITY.
        if (response.code == CURRENT_ENTITY_ARCHIVED) {
            console.log('okay channel archived');
            $scope.updateLeftPanelCaller();
            $rootScope.toDefault = true;
            return;
        }

        if (response.code == INVALID_SECURITY_TOKEN) {
            console.debug('INVALID SECURITY TOKEN.');
            $state.go('signin');
            return;
        }
    }

});
