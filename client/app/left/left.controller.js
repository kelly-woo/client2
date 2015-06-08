'use strict';

var app = angular.module('jandiApp');

app.controller('leftPanelController1', function(
  $scope, $rootScope, $state, $stateParams, $filter, $modal, $window, $timeout, leftpanelAPIservice, leftPanel,
  entityAPIservice, entityheaderAPIservice, accountService, publicService, memberService, storageAPIservice, analyticsService, tutorialService,
  currentSessionHelper, fileAPIservice, fileObjectService, jndWebSocket, jndPubSub, modalHelper, UnreadBadge) {

  //console.info('[enter] leftpanelController');

  /**
   * @namespace
   * @property {boolean} hasBroadcast - left panel을 업데이트 한 후 다른 컨트롤러에 broadcast를 통해 알려줘야 할 경우 true
   * @property {string{ broadcastTo - broadcast 할 이벤트의 이름
   *
   * FIXME: SERVICE에서 이 variable과 관련된 모든 펑션들을 관리하는게 더 좋을 것같아요.
   */
  var afterLeftInit = {
    hasBroadcast: false,
    broadcastTo: ''
  };

  //unread 갱신시 $timeout 에 사용될 타이머
  var unreadTimer;

  //unread 위치에 대한 정보
  $scope.unread = {
    above: [],
    below: []
  };
  
  // 로딩이 진행되고 있을 경우 true
  $scope.isLoading = false;

  // left panel 에 토픽 리스트가 접혀있는 상태인지 아닌지 확인하는 부분.
  $scope.leftListCollapseStatus = {
    isTopicsCollapsed: storageAPIservice.isLeftTopicCollapsed() || false
  };

  

  // 처음에 state의 resolve인 leftPanel의 상태를 확인한다.
  var response = null;
  if (!leftPanel) return;

  // leftPanel의 상태가 200이 아닐 경우 에러로 처리.
  if (leftPanel.status != 200) {
    var err = leftPanel.data;
    $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
  } else {
    response = leftPanel.data;
  }

  _attachExtraEvents();

  $rootScope.$on('onBadgeCountChanged', updateUnreadPosition);
  
  $scope.$on('$destroy', _onDestroy);
  
  // 사용자가 참여한 topic의 리스트가 바뀌었을 경우 호출된다.
  $scope.$on('onJoinedTopicListChanged', function(event, param) {
    _setAfterLeftInit(param);
  });

  $scope.goUnreadBelow = goUnreadBelow;
  $scope.goUnreadAbove = goUnreadAbove;

  /**
   * 아래쪽 unread 로 scroll 이동  
   * @param {Event} clickEvent
   */
  function goUnreadBelow(clickEvent) {
    var jqTarget = $(clickEvent.target);
    var jqContainer = $('#lpanel-list-container');
    var scrollTop = jqContainer[0].scrollTop;
    var offsetTop = jqContainer.offset().top;
    var currentBottom = scrollTop + offsetTop + jqContainer.height();
    var top = _getPosUnreadBelow();

    var targetScrollTop = scrollTop + (top - currentBottom);

    jqContainer.animate({scrollTop: targetScrollTop + jqTarget.outerHeight()});
  }
  
  /**
   * 위쪽 unread 로 scroll 이동
   * @param {Event} clickEvent
   */
  function goUnreadAbove(clickEvent) {
    var jqTarget = $(clickEvent.target);
    var jqContainer = $('#lpanel-list-container');
    var scrollTop = jqContainer[0].scrollTop;
    var offsetTop = jqContainer.offset().top;
    var currentTop = scrollTop + offsetTop;
    var top = _getPosUnreadAbove();

    var targetScrollTop = scrollTop - (currentTop - top);
    
    jqContainer.animate({scrollTop: targetScrollTop - jqTarget.outerHeight()});
  }

  /**
   * 위쪽 unread 위치 반환
   * @returns {number}
   * @private
   */
  function _getPosUnreadAbove() {
    var above = $scope.unread.above;

    if (above.length) {
      return above[above.length - 1];
    } else {
      return 0;
    }
  }

  /**
   * 아래쪽 unread 위치 반환
   * @returns {number}
   * @private
   */
  function _getPosUnreadBelow() {
    var below = $scope.unread.below;
    return below[0] || 0;
  }

  /**
   * scope 소멸자
   * @private
   */
  function _onDestroy() {
    $timeout.cancel(unreadTimer);
    _detachExtraEvents();
  }

  /**
   * 이벤트 핸들러를 attach 한다.
   * @private
   */
  function _attachExtraEvents() {
    $(window).on('resize', updateUnreadPosition);
    $('#lpanel-list-container').on('scroll', updateUnreadPosition);
  }

  /**
   * 이벤트 핸들러 detach 한다.
   * @private
   */
  function _detachExtraEvents() {
    $(window).off('resize', updateUnreadPosition);
    $('#lpanel-list-container').off('scroll', updateUnreadPosition);
  }

  /**
   * unread position 을 업데이트한다.
   * 중복 호출에 대한 성능 향상을 위해 timeout 을 사용한다.
   */
  function updateUnreadPosition() {
    $timeout.cancel(unreadTimer);
    unreadTimer = $timeout(function() {
      _updateUnreadPosition();
    }, 0);
  }

  /**
   * unread position 을 업데이트한다.
   * @private
   */
  function _updateUnreadPosition() {
    var jqContainer = $('#lpanel-list-container');
    var scrollTop = jqContainer[0].scrollTop;
    var offsetTop = jqContainer.offset().top;
    var height = jqContainer.height();

    var top = scrollTop + offsetTop;
    var bottom = top + height;

    $scope.unread = UnreadBadge.getUnreadPos(top, bottom);
  }

  /**
   * left panel 업데이트 후에 알려줘야 할 컨틀롤러가 있음을 설정한다.
   * @param param {string} broadcast할 이벤트 이름
   * @private
   *
   * FIXME: SERVICE로 빼시오.
   */
  function _setAfterLeftInit(param) {
    afterLeftInit.hasBroadcast = true;
    afterLeftInit.broadcastTo = param;
  }

  /**
   * left panel 업데이트 후에 알려줘야 할 컨트롤러가 없음을 설정한다.
   * @private
   *
   * FIXME: SERVICE로 빼시오.
   */
  function _resetAfterLeftInit() {
    afterLeftInit.hasBroadcast = false;
  }

  /**
   * left panel 업데이트 후에 알려줘야 할 컨트롤러가 있는지 없는지 확인한다.
    * @returns {boolean} true, 있을 경우
   * @private
   *
   * FIXME: SERVICE로 빼시오.
   */
  function _hasAfterLeftInit() {
    return afterLeftInit.hasBroadcast;
  }

  /**
   * left panel 업데이트 후 broadcast를 날린다.
   * @private
   *
   * FIXME: SERVICE로 빼시오.
   */
  function _broadcastAfterLeftInit() {
    jndPubSub.pub(afterLeftInit.broadcastTo);
  }

  //  redirecting to default channel.
  /**
   * 이 팀의 default topic으로 돌아간다.
   *
   * FIXME: Change '$watch' to '$on'.
   */
  $rootScope.$watch('toDefault', function(newVal, oldVal) {
    if (newVal) {
      $state.go('archives', {entityType:'channels',  entityId:leftpanelAPIservice.getDefaultChannel(response) });
      $rootScope.toDefault = false;
    }
  });

  /**
   * entityId를 항상 주시하고 있다가 바뀔때마나 currentEntity를 바꿔준다.
   */
  $scope.$watch('$state.params.entityId', function(newEntityId){
    if (!newEntityId) return;

    _setCurrentEntityWithTypeAndId($state.params.entityType, newEntityId)

  });

  /**
   * $rootScope에 있는 currentEntity를 업데이트해준다.
   * @param entityType {string} 엔티티의 타입
   * @param entityId {string 혹은 number} 엔티티의 아이디
   * @private
   */
  function _setCurrentEntityWithTypeAndId(entityType, entityId) {
    var currentEntity = entityAPIservice.getEntityById(entityType, entityId);

    if (angular.isUndefined(currentEntity)) {
      return;
    }

    $rootScope.currentEntity = entityAPIservice.setCurrentEntity(currentEntity);
  }

  /**
   * @namespace
   * @property {boolean} topicTutorial - topic 관련 tutorial 을 봤는지 안 봤는지 알려주는 상태
   * @property {boolean} chatTutorial - chat 관련 tutorial 을 봤는지 안 봤는지 알려주는 상태
   * @property {boolean} fileTutorial - file 관련 tutorial 을 봤는지 안 봤는지 알려주는 상태
   * @property {number} count - 봐야 할 tutorial 의 갯수
   *
   * TODO: 튜토리얼 관련 서비스를 만드시오! 거기서 관리하시오! $rootScope에서 나가시오! left controller 에서도 나가시오!
   */
  $rootScope.tutorialStatus = {
    topicTutorial   : true,
    chatTutorial    : true,
    fileTutorial    : true,
    count           : 3
  };

  /**
   * Tutorial 상태를 초기화 한다.
   */
  $scope.$on('initTutorialStatus', function() {
    $scope.initTutorialStatus();
  });

  /**
   * 각 tutorial 의 반짝이는 동그라미가 클릭되었을 경우 반응한다.
   */
  $scope.$on('onTutorialPulseClick', function(event, $event) {
    $scope.onTutorialPulseClick($event);
  });

  /**
   * Tutorial 상태를 초기화 한다.
   */
  $scope.initTutorialStatus = function() {
    // user hasn't seen tutorial yet.
    $scope.tutorialStatus.topicTutorial = false;
    $scope.tutorialStatus.chatTutorial  = false;
    $scope.tutorialStatus.fileTutorial  = false;
    $scope.tutorialStatus.count         = 3;

    openTutorialModal('welcomeTutorial');
  };

  // left panel controller 에 들어오면 항상 호출되어야 한다.
  initLeftList();

  /**
   *  초기에 left panel 에 관련된 모든 정보를 불러온 후 정렬한다.
   * TODO: MOVE VARIABLES FROM '$rootScope' to 'session.service'
   */
  function initLeftList () {
    // 1. 현재 팀의 멤버가 아니거나
    // 2. 로그인을 해야 하는 상황이 아닌 경우에는
    // 로그아웃 시키고 sign in page 로 돌아간다.
    if (!storageAPIservice.isValidValue(memberService.getMember()) && !storageAPIservice.shouldAutoSignIn() ) {
      console.log('you are not supposed to be here!');
      publicService.signOut();
    }

    // 현재 팀을 세션에 저장한다.
    currentSessionHelper.setCurrentTeam(response.team);

    // 현재 팀을 $rootScope 에 저장한다.
    $rootScope.team = currentSessionHelper.getCurrentTeam();

    // 현재 멤버 정보를 세션에 저장한다.
    memberService.setMember(response.user);

    // Check socket status when loading.
    _checkSocketStatus();

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
    } else {
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
    var joindData = leftpanelAPIservice.getJoinedChannelData($scope.joinEntities);

    // memberList         - List of all users except myself.
    // totalChannelList - All channels including both 'joined' and 'not joined'
    var generalData = leftpanelAPIservice.getGeneralData($scope.totalEntities, $scope.joinEntities, memberService.getMemberId());

    _.extend($scope, generalData, joindData);

    //$scope.memberList           = generalData.memberList;
    //$scope.memberMap           = generalData.memberMap;
    //$scope.totalChannelList     = generalData.totalChannelList;
    //$scope.unJoinedChannelList  = generalData.unJoinedChannelList;

    //  Adding privateGroups to 'totalEntities' so that 'totalEntities' contains every entities.
    //  totalEntities   - Every entities.
    $scope.totalEntities = $scope.totalEntities.concat($scope.privateGroupList);
    ////////////    END OF PARSING      ////////////

    $rootScope.totalChannelList     = $scope.totalChannelList;
    $rootScope.joinedChannelList    = $scope.joinedChannelList;
    $rootScope.joinedChannelMap     = $scope.joinedChannelMap;
    $rootScope.privateGroupList     = $scope.privateGroupList;
    $rootScope.privateGroupMap      = $scope.privateGroupMap;
    $rootScope.memberList           = $scope.memberList;
    $rootScope.memberMap            = $scope.memberMap;
    $rootScope.totalEntities        = $scope.totalEntities;
    $rootScope.joinedEntities       = $scope.joinEntities;
    $rootScope.unJoinedChannelList  = $scope.unJoinedChannelList;

    currentSessionHelper.setCurrentTeam(response.team);
    currentSessionHelper.setCurrentTeamMemberList($scope.memberList);

    //  When there is unread messages on left Panel.
    if (response.alarmInfoCount != 0) {
      leftPanelAlarmHandler(response.alarmInfoCount, response.alarmInfos);
    }

    // generating starred list.
    if (memberService.getStarredEntities().length > 0) {
      setStar();
      $rootScope.$broadcast('onSetStarDone');
    }

    if ($state.params.entityId)
      _setCurrentEntityWithTypeAndId($state.params.entityType, $state.params.entityId);

    $rootScope.isReady = true;

    if (_hasAfterLeftInit()) {
      _broadcastAfterLeftInit();
      _resetAfterLeftInit();
    }

    $rootScope.$broadcast('onInitLeftListDone');
  }

  /**
   * Socket connection을 다시 한 번 체크한다.
   * @private
   */
  function _checkSocketStatus() {
    jndWebSocket.checkSocketConnection();
  }

  /**
   * 각 엔티티의 prefix 를 설정해준다.
   */
  function setEntityPrefix() {
    leftpanelAPIservice.setEntityPrefix($scope);
  }

  //  When there is anything to update, call this function and below function will handle properly.
  /**
   * left panel topic 의 뱃지 카운트를 업데이트 한다.
   * Update badge count.
   * @param alarmInfoCnt {number}
   * @param alarmsn {array}
   */
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

  /**
   * left panel 에 담겨 있는 모든 정보를 불러온다.
   */
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
  /**
   *
   */
  $rootScope.$on('updateLeftPanelCaller', function() {
    //console.info("[enter] updateLeftPanelCaller");
    $scope.updateLeftPanelCaller();
  });

  $scope.$on('leftOnMemberListChange', function() {
    $scope.memberList = currentSessionHelper.getCurrentTeamMemberList();
  });

  $scope.openModal = function(selector) {
    if (selector == 'join') {
      modalHelper.openTopicJoinModal($scope);
    } else if (selector == 'channel') {
      modalHelper.openTopicCreateModal($scope);
    } else if (selector == 'file') {
      modalHelper.openFileUploadModal($scope);
    } else if (selector == 'topic') {
      modalHelper.openTopicCreateModal($scope);
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
    modalHelper.openMemberProfileModal($scope, user);
  };

  // based on uesr.u_starredEntites, populating starred look-up list.
  function setStar() {
    _.forEach(memberService.getStarredEntities(), function(starredEntityId) {
      entityAPIservice.setStarred(starredEntityId);
    });
  }

  $scope.onTopicClicked = onTopicClicked;

  function onTopicClicked(entityType, entityId) {
    if (publicService.isNullOrUndefined($scope.currentEntity) || publicService.isNullOrUndefined($scope.currentEntity.id)) {
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
  $scope.onFileSelect = function($files, options) {
    var fileObject = Object.create(fileObjectService).init($files, options);
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

  response && currentTeamAdmin(response);

  // team의 현재 관리자 정보를 찾아서 설정함.
  function currentTeamAdmin(res) {
    var entities = res.entities;
    var entity;
    var i, len;

    for (i = 0, len = entities.length; i < len; ++i) {
      entity = entities[i];

      if (entity.u_authority === 'owner') {
        currentSessionHelper.setCurrentTeamAdmin(entity);
        break;
      }
    }
  }

});

