'use strict';

var app = angular.module('jandiApp');

app.controller('leftpanelController', function($scope, $rootScope, $state, $filter, $modal, $window, leftpanelAPIservice, leftPanel,
                                               user, defaultChannel, entityAPIservice, localStorageService) {

    console.info('[enter] leftpanelController');

    $scope.isDMCollapsed = false;
    $scope.isChListCollapsed = false;
    $scope.isPGCollapsed = false;

    var response = null;

    if (leftPanel.status != 200) {
        var err = leftPanel.data;
        $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
    } else {
        response = leftPanel.data;
    }

    //  redirecting to default channel.
    $rootScope.$watch('toDefault', function(newVal, oldVal) {
        if (newVal) {
            console.log('this is toDefault')
            $state.go('archives', {entityType:'channels',  entityId:defaultChannel });
            $rootScope.toDefault = false;
        }
    });

    $scope.$watch('$state.params.entityId', function(newEntityId){
        if (angular.isUndefined(entityAPIservice.getEntityById($state.params.entityType, newEntityId))) return;
        $scope.setCurrentEntity();
    });
    $scope.setCurrentEntity = function() {
        $rootScope.currentEntity = entityAPIservice.setCurrentEntity($state.params.entityType, $state.params.entityId);
    };

    initLeftList();

    function initLeftList () {
        $rootScope.team = $scope.team = response.team;

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
        $scope.joinedChannelList    = joinedList[0];
        $scope.privateGroupList     = joinedList[1];

        // userList         - List of all users except myself.
        // totalChannelList - All channels including both 'joined' and 'not joined'
        var generalList = leftpanelAPIservice.getGeneralList($scope.totalEntities, $scope.joinEntities, $scope.user.id);
        $scope.userList             = generalList[0];
        $scope.totalChannelList     = generalList[1];
        $scope.unJoinedChannelList  = generalList[2];

        //  Adding privateGroups to 'totalEntities' so that 'totalEntities' contains every entities.
        //  totalEntities   - Every entities.
        $scope.totalEntities = $scope.totalEntities.concat($scope.privateGroupList);

        ////////////    END OF PARSING      ////////////

        $rootScope.totalChannelList     = $scope.totalChannelList;
        $rootScope.joinedChannelList    = $scope.joinedChannelList;
        $rootScope.privateGroupList     = $scope.privateGroupList;
        $rootScope.userList             = $scope.userList;
        $rootScope.totalEntities        = $scope.totalEntities;
        $rootScope.joinedEntities       = $scope.joinEntities;
        $rootScope.unJoinedChannelList  = $scope.unJoinedChannelList;
        $rootScope.user                 = $scope.user;

        //  entityAPI.hasPrivilegeHelper is watching
        $rootScope.isLeftUpdated        = true;

        //  When there is unread messages on left Panel.
        if (response.alarmInfoCount != 0) {
            leftPanelAlarmHandler(response.alarmInfoCount, response.alarmInfos);
        }

        $scope.setCurrentEntity();
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
        _.each(alarms, function(value, key, list) {
            // TODO: 서버님께서 0을 주시는 이유가 궁금합니다.
            if (value.alarmCount == 0 )
                return;

            var tempEntity = entityAPIservice.getEntityFromListById($scope.totalEntities, value.entityId);

            //  tempEntity is archived
            if (angular.isUndefined(tempEntity)) {
                return;
            }

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

    // User pressed an enter key from invite modal view in private group.
    $scope.onUserSelected = function() {
        $scope.selectedUser.selected = true;
        $scope.selectedUser = '';
    };

    // Whenever left panel needs to be updated, just invoke 'updateLeftPanel' event.
    $scope.updateLeftPanelCaller = function() {
        $rootScope.isLeftUpdated= false;
        getLeftLists();
    };

    // Whenever left panel needs to be updated, just invoke 'updateLeftPanel' event.
    $rootScope.$on('updateLeftPanelCaller', function() {
        console.info("[enter] updateLeftPanelCaller");
        $scope.updateLeftPanelCaller();
    });

    $scope.openModal = function(selector) {
        if (selector == 'join') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/join.html',
                controller  :   'joinModalCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'channel') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.channel.html',
                controller  :   'createEntityModalCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'private') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.private.html',
                controller  :   'createEntityModalCtrl',
                size        :   'lg'
            });
        }
    };

    $rootScope.$on('onUserClick', function(event, user) {
        $scope.onUserClick(user);
    });


    //  Add 'onUserClick' to redirect to direct message to 'user'
    //  center and header are calling.
    $scope.onUserClick = function(user) {
        if (angular.isNumber(user)) {
            user = entityAPIservice.getEntityFromListById($scope.userList, user)
        }
        openUserProfile(user);
    };

    //  Open user profile modal view.
    function openUserProfile(user) {
        $modal.open({
            scope       :   $scope,
            templateUrl :   'app/modal/profile.view.html',
            controller  :   'profileViewerCtrl',
            windowClass :   'profile-view-modal',
            resolve     :   {
                curUser     : function getCurUser(){ return user; }
            }
        });
    }

    $scope.onDMInputFocus = function() {
        $('.absolute-search-icon').animate({opacity: 1}, 400);
    };

    $scope.onDMInputBlur = function() {
        $('.absolute-search-icon').stop().css({'opacity' : 0.2});
    }
});
