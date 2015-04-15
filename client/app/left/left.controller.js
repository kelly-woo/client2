//(function() {
//    'use strict';
//
//    angular
//        .module('jandiApp')
//        .controller('leftPanelController', leftPanelController);
//
//
//    function leftPanelController($scope, $rootScope, storageAPIservice, accountService,  leftPanel, leftpanelAPIservice) {
//        var vm = this;
//
//        $rootScope.isDMCollapsed = false || storageAPIservice.isLeftDMCollapsed();
//        $rootScope.isTopicCollapsed = false || storageAPIservice.isLeftTopicCollapsed();
//        $rootScope.isPGCollapsed = true || storageAPIservice.isLeftPGCollapsed();
//
//        accountService.setMember(leftPanel.data.user);
//
//        var joinedList = leftpanelAPIservice.getJoinedChannelList(leftPanel.data.joinEntities);
//
//        $scope.joinedChannelList    = joinedList[0];
//        $scope.privateGroupList     = joinedList[1];
//
//
//        vm.onUserContainerClick = function() {
//            console.log('mb')
//        }
//    }
//})();

'use strict';

var app = angular.module('jandiApp');


// 사용되지 않는 arguments: $stateParams, $modal, $window, $timeout
app.controller('leftPanelController1', function(
  $scope, $rootScope, $state, $stateParams, $filter, $modal, $window, $timeout, leftpanelAPIservice, leftPanel,
  entityAPIservice, entityheaderAPIservice, accountService, publicService, memberService, storageAPIservice, analyticsService, tutorialService,
  currentSessionHelper, fileAPIservice, fileService) {

  //console.info('[enter] leftpanelController');



  $scope.isLoading = false;

  $scope.leftListCollapseStatus = {
    isTopicsCollapsed: storageAPIservice.isLeftTopicCollapsed() || false
  };

  var response = null;
  if (!leftPanel) return;
  if (leftPanel.status != 200) {
    var err = leftPanel.data;
    $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
  } else {
    response = leftPanel.data;
  }

  $rootScope.$on('goToDefault', function() {
    $state.go('archives', {entityType:'channels',  entityId:leftpanelAPIservice.getDefaultChannel(response) });
    $rootScope.toDefault = false;
  });
  //  redirecting to default channel.
  $rootScope.$watch('toDefault', function(newVal, oldVal) {
    if (newVal) {
      $state.go('archives', {entityType:'channels',  entityId:leftpanelAPIservice.getDefaultChannel(response) });
      $rootScope.toDefault = false;
    }
  });



  // TODO: THERE HAS TO BE A BETTER WAY TO DO THIS.
  $scope.$watch('leftListCollapseStatus.isTopicsCollapsed',
    function(newVal, oldVal) {
      storageAPIservice.setLeftListStatus($scope.leftListCollapseStatus);
    }
  );


  $scope.$watch('$state.params.entityId', function(newEntityId){
    if (!newEntityId) return;

    _setCurrentEntityWithTypeAndId($state.params.entityType, newEntityId)

  });

  function _setCurrentEntityWithTypeAndId(entityType, entityId) {
    var currentEntity = entityAPIservice.getEntityById(entityType, entityId);

    if (angular.isUndefined(currentEntity)) {
      return;
    }

    $rootScope.currentEntity = entityAPIservice.setCurrentEntity(currentEntity);
  }

  // tutorial status
  $rootScope.tutorialStatus = {
    topicTutorial   : true,
    chatTutorial    : true,
    fileTutorial    : true,
    count           : 3
  };

  $scope.$on('initTutorialStatus', function() {
    $scope.initTutorialStatus();
  });

  $scope.$on('onTutorialPulseClick', function(event, $event) {
    $scope.onTutorialPulseClick($event);
  });
  $scope.initTutorialStatus = function() {
    // user hasn't seen tutorial yet.
    $scope.tutorialStatus.topicTutorial = false;
    $scope.tutorialStatus.chatTutorial  = false;
    $scope.tutorialStatus.fileTutorial  = false;
    $scope.tutorialStatus.count         = 3;

    openTutorialModal('welcomeTutorial');
  };

  initLeftList();


  // TODO: MOVE VARIABLES FROM '$rootScope' to 'session.service'
  function initLeftList () {
    if (!storageAPIservice.isValidValue(memberService.getMember()) && !storageAPIservice.shouldAutoSignIn() ) {
      console.log('you are not supposed to be here!');
      publicService.signOut();
    }

    memberService.setMember(response.user);

    $rootScope.team = response.team;
    currentSessionHelper.setCurrentTeam(response.team);

    // Signed in with token. So there will no account info.
    // Currently, there is no page that uses account info right after user signed in.
    // As a result, get Account info asynchronously, meaning there may a short period of time that app is waiting for account info.
    if (_.isUndefined(accountService.getAccount())) {
      accountService.getAccountInfo()
        .success(function(response) {
          accountService.setAccount(response);
          publicService.getLanguageSetting();
          publicService.setCurrentLanguage();

          _checkUpdateMessageStatus();

          analyticsService.accountIdentifyMixpanel(response);
          analyticsService.accountMixpanelTrack("Sign In");

          analyticsService.memberIdentifyMixpanel();
          analyticsService.mixpanelTrack("Sign In");
        })
        .error(function(err) {
          leftpanelAPIservice.toSignin();
        })
    }
    else {
      // Still check whether user needs to see tutorial or not.
      _checkUpdateMessageStatus();
    }



    $scope.totalEntityCount = response.entityCount;
    $scope.totalEntities    = response.entities;

    $scope.joinEntityCount  = response.joinEntityCount;
    $scope.joinEntities     = response.joinEntities;

    //  Setting prefix for each entity.
    setEntityPrefix();

    //  Separating 'channel' and 'privateGroup'.
    //  joinedChannelList   - List of joined channels.
    //  privateGroupList    - List of joined private groups.
    var joinedList = leftpanelAPIservice.getJoinedChannelList($scope.joinEntities);
    $scope.joinedChannelList    = joinedList[0];
    $scope.privateGroupList     = joinedList[1];

    // memberList         - List of all users except myself.
    // totalChannelList - All channels including both 'joined' and 'not joined'
    var generalList = leftpanelAPIservice.getGeneralList($scope.totalEntities, $scope.joinEntities, memberService.getMemberId());
    $scope.memberList           = generalList[0];
    $scope.totalChannelList     = generalList[1];
    $scope.unJoinedChannelList  = generalList[2];

    //  Adding privateGroups to 'totalEntities' so that 'totalEntities' contains every entities.
    //  totalEntities   - Every entities.
    $scope.totalEntities = $scope.totalEntities.concat($scope.privateGroupList);

    ////////////    END OF PARSING      ////////////

    $rootScope.totalChannelList     = $scope.totalChannelList;
    $rootScope.joinedChannelList    = $scope.joinedChannelList;
    $rootScope.privateGroupList     = $scope.privateGroupList;
    $rootScope.memberList           = $scope.memberList;
    $rootScope.totalEntities        = $scope.totalEntities;
    $rootScope.joinedEntities       = $scope.joinEntities;
    $rootScope.unJoinedChannelList  = $scope.unJoinedChannelList;

    currentSessionHelper.setCurrentTeam(response.team);
    currentSessionHelper.setCurrentTeamMemberList($scope.memberList);

    //  When there is unread messages on left Panel.
    if (response.alarmInfoCount != 0) {
      leftPanelAlarmHandler(response.alarmInfoCount, response.alarmInfos);
    }

    if (memberService.getStarredEntities().length > 0) {
      // generating starred list.
      setStar();
      $rootScope.$broadcast('onSetStarDone');
    }

    if ($state.params.entityId)
      _setCurrentEntityWithTypeAndId($state.params.entityType, $state.params.entityId);

    $rootScope.isReady = true;

    $rootScope.$broadcast('onInitLeftListDone');
  }

  function setEntityPrefix() {
    leftpanelAPIservice.setEntityPrefix($scope);
  }

  //  When there is anything to update, call this function and below function will handle properly.
  function leftPanelAlarmHandler(alarmInfoCnt, alarms) {
    _.each(alarms, function(value, key, list) {
      // TODO: 서버님께서 0을 주시는 이유가 궁금합니다.
      if (value.alarmCount == 0 )
        return;

      var tempEntity = entityAPIservice.getEntityFromListById($scope.joinedEntities, value.entityId);

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
        //console.log('-- getLeft good')
        initLeftList();
      })
      .error(function(err) {
        console.log(err);
      });
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

  // right, detail panel don't have direct access to scope function in left controller.
  // so they emit event through rootscope.
  $rootScope.$on('updateLeftPanelCaller', function() {
    //console.info("[enter] updateLeftPanelCaller");
    $scope.updateLeftPanelCaller();
  });

  $scope.openModal = function(selector) {
    if (selector == 'join') {
      publicService.openJoinModal($scope);
    }
    else if (selector == 'channel') {
      publicService.openTopicCreateModal($scope);
    }
    else if (selector == 'private') {
      publicService.openPrivateCreateModal($scope);
    }
    else if (selector == 'file') {
      publicService.openFileUploadModal($scope);
    }
    else if (selector == 'topic') {
      publicService.openTopicCreateModal($scope);
    }
  };

  $rootScope.$on('onUserClick', function(event, user) {
    $scope.onUserClick(user);
  });
  //  Add 'onUserClick' to redirect to direct message to 'user'
  //  center and header are calling.
  $scope.onUserClick = function(user) {
    if (angular.isNumber(user)) {
      user = entityAPIservice.getEntityFromListById($scope.memberList, user)
    }
    else {
      user = entityAPIservice.getEntityFromListById($scope.memberList, user.id)
    }
    publicService.openMemberProfileModal($scope, user);
  };

  // based on uesr.u_starredEntites, populating starred look-up list.
  function setStar() {
    _.forEach(memberService.getStarredEntities(), function(starredEntityId) {
      entityAPIservice.setStarred(starredEntityId);
    });
  }

  $scope.onTopicClicked = onTopicClicked;

  function onTopicClicked(entityType, entityId) {
    if (publicService.isNullOrUndefined($scope.currentEntity.id)) {
      publicService.goToDefaultTopic();
      return;
    }

    if ($scope.currentEntity.id == entityId) {
      $rootScope.$broadcast('refreshCurrentTopic');
    } else {
      $state.go('archives', { entityType: entityType, entityId: entityId });
    }
  }


  $scope.$on('onStarClick', function(event, params) {
    $scope.onStarClick(params.entityType, params.entityId)
  });

  $scope.onStarClick = function(entityType, entityId) {
    var entity = entityAPIservice.getEntityById(entityType, entityId);

    if (entity.isStarred) {
      entityheaderAPIservice.removeStarEntity(entityId)
        .success(function(response) {
          getLeftLists();
          // TODO: UPDATE CURRENT ONLY.
          // TODO: CALL 'setStar()' afterwards.
        })
        .error(function(response) {
        });
    }
    else {
      // current entity is not starred entity.
      entityheaderAPIservice.setStarEntity(entityId)
        .success(function(response) {
          getLeftLists();
        })
        .error(function(response) {
        });

    }
  };

  $scope.toggleLoading = function() {
    $scope.isLoading = !$scope.isLoading;
  };


  $scope.onImageRotatorClick = function($event) {
    var sender = angular.element($event.target);
    var senderID = sender.attr('id');

    var target = '';
    switch(senderID){
      case 'fromModal':
        target = sender.parent().siblings('img.image-background').parent();
        break;
      case 'fromCenterLargeThumbnail':
        target = sender.parent().siblings('img#large-thumbnail');
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



  /*********************************************************************
   *
   *  FILE related controller
   *
   *********************************************************************/
  $scope.$on('onFileSelect', function(event, files){
    $scope.onFileSelect(files);
  });
  // Callback function from file finder(navigation) for uploading a file.
  $scope.onFileSelect = function($files) {
    var fileObject = Object.create(fileService).init($files);
    if (fileObject.size() > 0) {
      $rootScope.supportHtml5 = angular.isDefined(FileAPI.support) ? !!FileAPI.support.html5 : fileObject.options.supportAllFileAPI;
      $scope.fileObject = fileObject;
      $scope.openModal('file');
    }
  };

  $scope.onFileUploadAbortClick = function() {
    if (angular.isUndefined($rootScope.fileQueue)) return;
    $rootScope.fileQueue.abort('abort');
    $rootScope.curUpload.progress = 0;
    $rootScope.curUpload.isAborted = true;
  };

  $scope.onFileIconCloseClick = function() {
    $('.file-upload-progress-container').animate( {'opacity': 0 }, 500,
      function() {
        fileAPIservice.clearCurUpload();
      }
    )
  };

  /*********************************************************************
   *
   *  Tutorial related controller
   *
   *********************************************************************/
  function _checkUpdateMessageStatus() {
    if(!accountService.hasSeenTutorial()) {
      $scope.initTutorialStatus();
    }
    else if(accountService.hasChangeLog()) {
      _openChangeLogPopUp();
    }
  }

  function _openChangeLogPopUp() {
    var modal = tutorialService.openRightChangeLogModal();

    modal.result.then(function (reason) {
      _updateChangeLogTime();
    });
  }
  $scope.onTutorialPulseClick = function($event) {
    var TutorialId = $event.target.id;
    setTutorialStatus(TutorialId);
    openTutorialModal(TutorialId);
  };

  function setTutorialStatus(tutorialId) {
    switch(tutorialId){
      case 'topicTutorial':
        $scope.tutorialStatus.topicTutorial = true;
        $scope.tutorialStatus.count -= 1;

        $('#topicTutorial').removeClass('pulse');
        break;
      case 'chatTutorial' :
        $scope.tutorialStatus.chatTutorial = true;
        $scope.tutorialStatus.count -= 1;

        $('#chatTutorial').removeClass('pulse');
        break;
      case 'fileTutorial' :
        $scope.tutorialStatus.fileTutorial = true;
        $scope.tutorialStatus.count -= 1;

        $('#fileTutorial').removeClass('pulse');
        break;
      default :

        $('#topicTutorial').removeClass('pulse');
        $('#chatTutorial').removeClass('pulse');
        $('#fileTutorial').removeClass('pulse');

        $scope.tutorialStatus.topicTutorial = true;
        $scope.tutorialStatus.chatTutorial = true;
        $scope.tutorialStatus.fileTutorial = true;

        _updateChangeLogTime();

        break;
    }
  }
  function _updateChangeLogTime() {
    tutorialService.setTutoredAtTime()
      .success(function(response) {

        //accountService.setAccount(response);
        accountService.updateAccountTutoredTime(response.tutoredAt);
      })
      .error(function(err) {

      })
      .finally(function() {

      });
  }
  function openTutorialModal(tutorialId) {
    var modal = publicService.openTutorialModal(tutorialId);

    modal.result.then(function (reason) {
      if (reason === 'skip' || $scope.tutorialStatus.count == 0) {
        setTutorialStatus();
      }
    });
  }

});

