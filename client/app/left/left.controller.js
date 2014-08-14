'use strict';

var app = angular.module('jandiApp');

app.controller('leftpanelController', function($scope, $rootScope, $state, $filter, $modal, $window, leftpanelAPIservice, leftPanel, user, defaultChannel, entityAPIservice) {

    console.info('[enter] leftpanelController');

    var response = null;


    if (leftPanel.status != 200) {
        var err = leftPanel.data;
        $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
    } else {
        response = leftPanel.data;
    }

    initLeftList();

    function initLeftList () {

        // Just making sure to close modal view if any of them left opened.
        //$('.modal').modal('hide');

//        console.info('[leftPanel] ' )

        $scope.team             = response.team;

        $scope.totalEntityCount = response.entityCount;
        $scope.totalEntities    = response.entities;

        $scope.joinEntityCount  = response.joinEntityCount;
        $scope.joinEntities     = response.joinEntities;

        $scope.user = response.user;

        //  Setting prefix for each entity.
        setEntityPrefix();

        //  Separating 'channel' and 'privateGroup'.
        //  joinedChannelList   - List of joined channels.
        //  privateGroupList    - List of joined private groups.
        var joinedList = leftpanelAPIservice.getJoinedChannelList($scope.joinEntities);
        $scope.joinedChannelList = joinedList[0];
        $scope.privateGroupList = joinedList[1];


        // userList         - List of all users except myself.
        // totalChannelList - All channels including both 'joined' and 'not joined'
        var generalList = leftpanelAPIservice.getGeneralList($scope.totalEntities, $scope.joinEntities, $scope.user.id);
        $scope.userList = generalList[0];
        $scope.totalChannelList = generalList[1];
        $scope.unJoinedChannelList = generalList[2];

        //  Adding privateGroups to 'totalEntities' so that 'totalEntities' contains every entities.
        //  totalEntities   - Every entities.
        $scope.totalEntities = $scope.totalEntities.concat($scope.privateGroupList);

        ////////////    END OF PARSING      ////////////

//        console.log(defaultChannel)
//        if (defaultChannel) {
//            console.log('broadcasting')
//            $scope.$broadcast('goToDefaultChannel', defaultChannel);
//        }

        // Update difference between number of all channels and currently joined channels.
        hasMoreChannelsToJoin($scope.totalChannelList.length, $scope.joinedChannelList.length);

        $rootScope.totalChannelList     = $scope.totalChannelList;
        $rootScope.joinedChannelList    = $scope.joinedChannelList;
        $rootScope.privateGroupList     = $scope.privateGroupList;
        $rootScope.userList             = $scope.userList;
        $rootScope.totalEntities        = $scope.totalEntities;
        $rootScope.joinedEntities       = $scope.joinEntities;
        $rootScope.unJoinedChannelList  = $scope.unJoinedChannelList;
        $rootScope.user                 = $scope.user;

        //  When there is unread messages on left Panel.
        if (response.alarmInfoCount != 0) {
//            console.log(response.alarmInfos)
            leftPanelAlarmHandler(response.alarmInfoCount, response.alarmInfos);
        }

        if ($state.current.name.indexOf('messages.home') != -1) {
            $state.go('archives', {entityType:'channels',  entityId:defaultChannel });
        }



    }

    //  Initialize correct prefix for 'channel' and 'user'.
    function setEntityPrefix() {
        _.each($scope.totalEntities, function(entity) {
            entity.prefix = "";
            if (entity.type === 'channel') {
                entity.prefix = "#";
            } else if (entity.type === 'user') {
                entity.prefix = "@";
            }
        });
        _.each($scope.joinEntities, function(entity) {
            entity.prefix = "";
            if (entity.type === 'channel') {
                entity.prefix = "#";
            } else if (entity.type === 'user') {
                entity.prefix = "@";
            } else {
                entity.prefix = "";
            }
        });
    }

    //  When there is anything to update, call this function and below function will handle properly.
    function leftPanelAlarmHandler(alarmInfoCnt, alarms) {
//       console.log(alarms);
        _.each(alarms, function(value, key, list) {
            // TODO: 서버님께서 0을 주시는 이유가 궁금합니다.
            if (value.alarmCount == 0 )
                return;

            //  TODO: tempEntity가 user 타입일 경우 잘 안되네요????
            var tempEntity = entityAPIservice.getEntityFromListById($scope.totalEntities, value.entityId);

            //  tempEntity is archived
            if (angular.isUndefined(tempEntity)) {
                console.log('=================')
                console.log('got left alarm but UNDEFINED')
                console.log(value)
                console.log('=================')
                return;
            }
            else {
                console.log('=================')
                console.log('got left alarm')
                console.log(tempEntity.name)
                console.log(value.alarmCount)
                console.log(value)
                console.log('===============')
            }

//            console.log(tempEntity)
//            console.log('leftPanelAlarmUpdate "' + tempEntity.name + '/' + tempEntity.id + '" to ' + value.alarmCount)
            entityAPIservice.updateBadgeValue(tempEntity, value.alarmCount);
        });
    }

    function getLeftLists() {
        leftpanelAPIservice.getLists()
            .success(function(data) {
                response = data;
                initLeftList();
            })
            .error(function(err) {
                $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
            });
    }


    $scope.getCurrentEntity = function() {
        return $scope.currentEntity;
    };

    // Checking whether user joined all possible channels or not.
    function hasMoreChannelsToJoin(a, b) {
        $scope.channelsLeft = a - b;
    }

    // User pressed an enter key from invite modal view in private group.
    $scope.onUserSelected = function() {
        $scope.selectedUser.selected = true;
        $scope.selectedUser = '';
    };

    // Whenever left panel needs to be updated, just invoke 'updateLeftPanel' event.
    $scope.updateLeftPanelCaller = function() {
        getLeftLists();
    };

    $rootScope.$on('updateLeftPanelCaller', function() {
        console.info("[enter] updateLeftPanelCaller");
        getLeftLists();
    });

    $scope.openModal = function(selector) {
        if (selector == 'join') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/join.html',
                controller  :   joinModalCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'channel') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.channel.html',
                controller  :   createEntityModalCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'private') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.private.html',
                controller  :   createEntityModalCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'user') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/list.user.html',
                controller  :   userModalCtrl,
                size        :   'lg',
                windowClass :   'allowOverflowY'
            });
        }
        else if (selector == 'invite') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/invite.team.html',
                controller  :   inviteUserToTeamCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'agreement') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/terms/agreement.html',
                size        :   'lg'
            });
        }
        else if (selector == 'privacy') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/terms/privacy.html',
                size        :   'lg'
            });
        }
    };

});
