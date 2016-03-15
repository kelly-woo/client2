/**
 * @fileoverview jandi main controller
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndMainCtrl', JndMainCtrl);

  function JndMainCtrl($scope, $filter, Dialog, EntityMapManager, entityAPIservice, jndPubSub, memberService,
                          currentSessionHelper, TopicInvitedFlagMap, JndUtil) {
    $scope.isShowDummyLayout = false;
    $scope.tutorial = {
      isShowWelcome: false,
      isShowPopover: false
    };

    $scope.connectSetting = {
      isOpen: false,
      params: null
    };
    var _inviteSocketQueue = [];

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      _attachEvents();
    }

    /**
     * 이벤트 핸들러를 바인딩 한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('publicService:hideDummyLayout', _onHideDummyLayout);
      $scope.$on('publicService:showDummyLayout', _onShowDummyLayout);

      $scope.$on('kickedOut', _onKickedOut);
      $scope.$on('topicInvite', _onTopicInvite);
      $scope.$on('topicLeave', _onTopicLeave);
      $scope.$on('EntityHandler:parseLeftSideMenuDataDone', _updateInvitedMemberList);

      $scope.$on('JndConnect:open', _onJndConnectOpen);
      $scope.$on('JndConnect:close', _onJndConnectClose);

      $scope.$on('Tutorial:showWelcome', _onShowTutorialWelcome);
      $scope.$on('Tutorial:hideWelcome', _onHideTutorialWelcome);

      $scope.$on('Tutorial:showPopover', _onShowTutorialPopover);
      $scope.$on('Tutorial:hidePopover', _onHideTutorialPopover);
    }

    function _onShowDummyLayout() {
      $scope.isShowDummyLayout = true;
    }
    function _onHideDummyLayout() {
      $scope.isShowDummyLayout = false;
    }

    /**
     * Welcome 튜토리얼 Show 이벤트 핸들러
     * @private
     */
    function _onShowTutorialWelcome() {
      $scope.tutorial.isShowWelcome = true;
    }

    /**
     * Welcome 튜토리얼 Hide 이벤트 핸들러
     * @private
     */
    function _onHideTutorialWelcome() {
      $scope.tutorial.isShowWelcome = false;
    }

    /**
     * Popover 튜토리얼 Show 이벤트 핸들러
     * @private
     */
    function _onShowTutorialPopover() {
      $scope.tutorial.isShowPopover = true;
    }

    /**
     * Popover 튜토리얼 Hide 이벤트 핸들러
     * @private
     */
    function _onHideTutorialPopover() {
      $scope.tutorial.isShowPopover = false;
    }
    /**
     * connect setting show 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} [params=null] - 세팅 회면 진입 시 connectId 의 수정 페이지를 바로 노출할 경우 해당 변수를 전달해야 한다.
     *  @param  {string} params.unionName - union 이름
     *  @param  {number} params.connectId - connectId
     * @private
     */
    function _onJndConnectOpen(angularEvent, params) {
      JndUtil.safeApply($scope, function() {
        $scope.connectSetting.isOpen = true;
        $scope.connectSetting.params = params || null;
      });
    }

    /**
     * connect hide 이벤트 핸들러
     * @private
     */
    function _onJndConnectClose() {
      JndUtil.safeApply($scope, function() {
        $scope.connectSetting.isOpen = false;
        $scope.connectSetting.params = null;
      });
    }

    /**
     * kick out 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} socketEvent
     * @private
     */
    function _onKickedOut(angularEvent, socketEvent) {
      var topicEntity = EntityMapManager.get('total', socketEvent.data.roomId);
      var topicName = topicEntity.name;
      var msgTmpl = $filter('translate')('@common-kicked-out');
      var msg = msgTmpl.replace('{{TopicName}}', topicName);
      Dialog.warning({
        body:  msg,
        extendedTimeOut: 0,
        timeOut: 0
      });
    }

    /**
     * topic invite 이벤트 핸들러
     * 해당 entity 에 member 를 추가한다
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onTopicInvite(angularEvent, data) {
      var entity = EntityMapManager.get('total', data.room.id);
      var room = data.room;

      if (!entity || _hasInvitedFlag(entity, data.inviter)) {
        TopicInvitedFlagMap.add(room.id);
        //entity 정보가 업데이트 되기 이전이므로 queue 에 저장만 한다
        _inviteSocketQueue.push(data);
      }
    }

    /**
     * invited member list 를 업데이트 한다
     * @private
     */
    function _updateInvitedMemberList() {
      var hasMemberToUpdate = !!_inviteSocketQueue.length;

      while (_inviteSocketQueue.length) {
        var data = _inviteSocketQueue.pop();
        var entity = EntityMapManager.get('total', data.room.id);
        var memberList = entityAPIservice.getMemberList(entity);
        var filter = $filter('translate');
        var msg;
        var topicName = $filter('htmlEncode')(entity.name);
        var invitorName = $filter('htmlEncode')($filter('getName')(data.writer));

        if (entity.type.indexOf('private') !== -1) {
          msg = filter('@topic-invite-private');
        } else {
          msg = filter('@topic-invite-public');
        }
        msg = msg.replace('{{invitorName}}', invitorName);
        msg = msg.replace('{{topicName}}', topicName);

        Dialog.success({
          body:  msg,
          allowHtml: true,
          onTap: function() {
            console.log('### onTap', arguments);
          },
          extendedTimeOut: 0,
          timeOut: 0
        });

        _.forEach(data.inviter, function(memberId) {
          if (memberList.indexOf(memberId) === -1) {
            memberList.push(memberId);
          }
        });
        entity.members = memberList;
      }
      if (hasMemberToUpdate) {
        jndPubSub.pub('room:memberAdded');
      }
    }

    /**
     * invited flag 를 가지는지 여부를 판단한다
     * @param {object} entity
     * @param {Array} inviter
     * @returns {boolean}
     * @private
     */
    function _hasInvitedFlag(entity, inviter) {
      var currentUserId = memberService.getMemberId();
      return !_isCurrentEntity(entity)  && inviter.indexOf(currentUserId) !== -1;
    }

    /**
     * 인자로 들어온 entity 가 현재 entity 인지 반환한다
     * @param {object} entity
     * @returns {boolean}
     * @private
     */
    function _isCurrentEntity(entity) {
      return currentSessionHelper.getCurrentEntity().id === (entity && entity.id);
    }

    /**
     * topic leave 이벤트 핸들러
     * 해당 entity 에 member 를 삭제한다
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onTopicLeave(angularEvent, data) {
      var room = EntityMapManager.get('total', data.room.id);
      var member = data.writer;
      var memberList;
      var index;

      if (room && (memberList = entityAPIservice.getMemberList(room))) {
        if (index = memberList.indexOf(member)) {
          index > -1 && memberList.splice(index, 1);
        }
      }
      room.members = memberList;

      jndPubSub.pub('room:memberDeleted');
    }
  }
})();
