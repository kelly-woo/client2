(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('AnnouncementCtrl', AnnouncementCtrl);

  /* @ngInject */
  function AnnouncementCtrl($scope, Announcement, AnnouncementData, memberService, $stateParams,
                            config, jndPubSub, $filter, publicService) {

    var _topicType = $stateParams.entityType;
    var _topicId = parseInt($stateParams.entityId, 10);

    var myId = memberService.getMemberId();

    var _announcement;

    var ANNOUNCEMENT_CREATED = config.socketEvent.announcement.created;
    var ANNOUNCEMENT_DELETED = config.socketEvent.announcement.deleted;
    var ANNOUNCEMENT_STATUS_UPDATED = config.socketEvent.announcement.status_updated;

    $scope.hasAnnouncement = false;
    $scope.displayStatus = {
      hide: false,
      minimized: false
    };

    $scope.onAnnouncementArrowClicked = onAnnouncementArrowClicked;
    $scope.onHidedAnnouncementClicked = onHidedAnnouncementClicked;

    $scope.onAnnouncementBodyClicked = onAnnouncementBodyClicked;

    $scope.onAnnouncementWriterClicked = onAnnouncementWriterClicked;
    $scope.onAnnouncementCreatorClicked = onAnnouncementCreatorClicked;

    $scope.isAnnouncementHided = isAnnouncementHided;
    $scope.isAnnouncmentMinimized = isAnnouncementMinimized;

    $scope.deleteAnnouncement = deleteAnnouncement;
    $scope.hideAnnouncement = hideAnnouncement;

    $scope.toggleAnnouncementStatus = toggleAnnouncementStatus;

    $scope.$on('$destroy', _onScopeDestroy);

    $scope.$on(config.socketEvent.announcement.created, _onAnnouncementSocketEvent);
    $scope.$on(config.socketEvent.announcement.deleted, _onAnnouncementSocketEvent);
    $scope.$on(config.socketEvent.announcement.status_updated, _onAnnouncementSocketEvent);

    $scope.$on('createAnnouncement', _createAnnouncement);


    _init();

    /**
     * 초기화 함수.
     * @private
     */
    function _init() {
      _attachWindowEvent();
      _getAnnouncement();
      memberService.isAnnouncementOpen(_topicId);

    }

    /**
     * 현재 토픽의 announcement 를 불러온다.
     * @private
     */
    function _getAnnouncement() {
      AnnouncementData.getAnnouncement(_topicId)
        .success(_onGetAnnouncementSuccess)
        .error(_onGetAnnouncementError);

    }

    /**
     * announcement 를 가져오기에 성공했을 때!
     * @param {object} announcement - server 로 부터 온 response
     * @private
     */
    function _onGetAnnouncementSuccess(announcement) {
      if (!_.isEmpty(announcement)) {
        _announcement = announcement;
        $scope.announcementCreator = _getActionOwner(announcement, announcement.creatorId, 'createdAt');
        $scope.announcementWriter = _getActionOwner(announcement, announcement.writerId, 'writtenAt');

        $scope.announcementBody = Announcement.getFilteredContentBody(announcement.content);

        _getAnnouncementStatus();
        _showAnnouncement();
      }
    }

    function _getAnnouncementStatus() {
      var isAnnouncementOpened = memberService.isAnnouncementOpen(_topicId);

      if (_.isUndefined(isAnnouncementOpened) || isAnnouncementOpened) {
        memberService.updateAnnouncementStatus(_topicId, true);
        minimizeAnnouncement();
      } else {
        // false 일때만 숨긴.
        hideAnnouncement();
      }

    }
    /**
     * announcement 를 가져오는데 실패했을 때
     * @param {object} error - server 로 부터 온 error object
     * @private
     */
    function _onGetAnnouncementError(error) {
    }

    /**
     * text controller 가 어나운스먼트 만들어주세요! 라고 이벤트를 날리면 호출된다.
     * @param {object} event - event(angular $broadcast) object
     * @param {object} param - event 에 해당하는 파라미터들.
     * @private
     */
    function _createAnnouncement(event, param) {
      var entityId = param.entityId;
      var messageId = param.messageId;

      if ($scope.hasAnnouncement &&
        confirm($filter('translate')('@announcement-create-confirm'))) {
        AnnouncementData.createAnnouncement(entityId, messageId);
      } else {
        AnnouncementData.createAnnouncement(entityId, messageId)
      }
    }

    /**
     * announcement 우측 상단에 있는 화살표를 눌렀을 경우
     */
    function onAnnouncementArrowClicked(event) {
      _blockEvent(event);
      if (isAnnouncementMinimized()) {
        maximizeAnnouncement();
      } else {
        minimizeAnnouncement();
      }
    }

    /**
     * 최소화된 공지사항을 클릭했을 경우.
     */
    function onHidedAnnouncementClicked() {
      toggleAnnouncementStatus();
    }

    /**
     * announcement 의 이벤트클릭을 받고 있다가 클릭된 부분이 어딘지에 따라 알맞는 펑션을 실행한다.
     * @param {object} event - click event object
     */
    function onAnnouncementBodyClicked(event) {
      _blockEvent(event);

      var jqTarget = $(event.target);

      if (Announcement.isAnchorElement(jqTarget)) {
        // link clicked, go to link.
        publicService.openNewTab(jqTarget.attr('href'));
      } else if (isAnnouncementMinimized()) {
        maximizeAnnouncement();
      } else if (Announcement.isOutsideAnnouncementBodyElement(jqTarget)) {
        minimizeAnnouncement();
      }
    }

    /**
     * announcement writer 가 클릭되었을 경우 멤버 프로필 모달을 연다.
     */
    function onAnnouncementWriterClicked(event) {
      _blockEvent(event);
      _openMemberProfileModal(_announcement.writerId);
    }

    /**
     * announcement creator 가 클릭되었을 경우 멤버 프로필 모달을 연다.
     */
    function onAnnouncementCreatorClicked(event) {
      _blockEvent(event);
      _openMemberProfileModal(_announcement.creatorId);
    }

    /**
     * 멤버 프로필 모달을 연다.
     * @param {number} memberId - 멤버의 아이디
     * @private
     */
    function _openMemberProfileModal (memberId) {
      jndPubSub.pub('onUserClick', memberId);
    }

    /**
     * announcement 의 visible status 를 true 로 바꿔준다.
     * @private
     */
    function _showAnnouncement() {
      $scope.hasAnnouncement = true;
      Announcement.adjustAnnouncementHeight();
    }

    /**
     * announcement dom element를 삭제한다.
     * @private
     */
    function _detachAnnouncement() {
      $scope.hasAnnouncement = false;
      memberService.removeAnnouncementStatus(_topicId);
    }

    /**
     * announcement 를 minimized 상태로 바꿔준다.
     * @private
     */
    function maximizeAnnouncement() {
      $scope.displayStatus.hide = false;
      $scope.displayStatus.minimized = false;

      Announcement.adjustAnnouncementHeight();
    }

    /**
     * announcement 를 extended 상태로 바꿔준다.
     * @private
     */
    function minimizeAnnouncement() {
      $scope.displayStatus.hide = false;
      $scope.displayStatus.minimized = true;
    }

    /**
     * announcement 가 숨겨져있는가?
     * @returns {boolean}
     */
    function isAnnouncementHided() {
      return $scope.displayStatus.hide;
    }

    /**
     * announcement 가 최소화되어있는가?
     * @returns {boolean}
     */
    function isAnnouncementMinimized() {
      return $scope.displayStatus.minimized;
    }

    /**
     * announcement 를 hide 상태로 바꿔준다.
     * @private
     */
    function hideAnnouncement() {
      $scope.displayStatus.hide = true;
    }

    /**
     * announcement 를 지운다.
     */
    function deleteAnnouncement(event) {
      _blockEvent(event);

      if (confirm($filter('translate')('@announcement-delete-confirm'))) {
        AnnouncementData.deleteAnnouncement(_topicId)
          .success(_detachAnnouncement);
      }

    }

    function toggleAnnouncementStatus(event) {
      _blockEvent(event);

      var isCurrentTopicAnnouncementOpen = !memberService.isAnnouncementOpen(_topicId);
      AnnouncementData.toggleAnnouncementStatus(myId, _topicId, isCurrentTopicAnnouncementOpen)
        .success(function(response) {
        })
        .error(function(err) {
          console.log(err)
        })
    }

    /**
     * actionType 에 따라 알맞는 멤버정보를 리턴한다.
     * @param {object} announcement - server로 부터 받은 announcement object
     * @param {number} entityId - 엔티티 아이디
     * @param {string} actionType - 액션의 종류
     * @returns {*}
     * @private
     */
    function _getActionOwner(announcement, entityId, actionType) {
      return Announcement.getActionOwner(announcement, entityId, actionType);
    }

    /**
     * $(window)에 event listener 를 붙힌다.
     * @private
     */
    function _attachWindowEvent() {
      $(window).on('resize', _onWindowResize);
    }

    /**
     * $(window)에서 event listener 를 분리한다.
     * @private
     */
    function _detachWindowEvent() {
      $(window).off('resize', _onWindowResize);
    }

    /**
     * $(window) 에 resize event listener 를 단다.
     * @private
     */
    function _onWindowResize() {
      if (!isAnnouncementHided() && !isAnnouncementMinimized()) {
        Announcement.adjustAnnouncementHeight();
      }
    }

    /**
     * $scope, 현재 스코프가 소멸될 때
     * @private
     */
    function _onScopeDestroy() {
      _detachWindowEvent();
    }

    function _onAnnouncementSocketEvent(event, data) {
      if (_isCurrentTopic(data.topicId)) {
        switch (event.name) {
          case ANNOUNCEMENT_CREATED:
            jndPubSub.updateChatList();
            _getAnnouncement();
            break;
          case ANNOUNCEMENT_DELETED:
            jndPubSub.updateChatList();
            _detachAnnouncement();
            break;
          case ANNOUNCEMENT_STATUS_UPDATED:
          default:
            memberService.updateAnnouncementStatus(_topicId, data.status);
            _getAnnouncementStatus();
            break;
        }
      }
    }

    /**
     * 현재 토픽아이디과 같은지 확인한다.
     * @param {number} eventTopic - topic id
     * @returns {boolean}
     * @private
     */
    function _isCurrentTopic(eventTopic) {
      return Announcement.isCurrentTopic(eventTopic, _topicId);
    }

    function test() {
      var testResponse = {
        "content": "모바일쪽에서 채팅목록 보여줄때 마지막 스티커를 (sticker) 로 보여주는 기능 개발해서 5000포트에 반영했습니다.",
        "writerId": 296,
        "messageId": 493024,
        "topicId": 314,
        "teamId": 279,
        "writtenAt": "2015-06-10T03:25:55.194Z",
        "status": "created",
        "creatorId": 285,
        "createdAt": "2015-06-23T04:05:19.275Z"
      };

      _onGetAnnouncementSuccess(testResponse);
    }
    function testWithLink() {
      var testResponse = {
        "content": "의자 http://shopping.naver.com/detail/detail.nhn?query=%EB%93%80%EC%98%A4%EB%B0%B1%20%EC%82%AC%EB%AC%B4%EC%9A%A9%EC%9D%98%EC%9E%90&cat_id=50003683&nv_mid=7885019416&frm=NVSCPRO 모바일쪽에서 채팅목록 보여줄때 마지막 스티커를 (sticker) 로 보여주는 기능 개발해서 5000포트에 반영했습니다.\n\n0 모바일쪽에서 채팅목록 보여줄때 마지막 스티커를 (sticker) 로 보여주는 기능 개발해서 5000포트에 반영했습니다.\n\n\n 모바일쪽에서 채팅목록 보여줄때 마지막 스티커를 (sticker) 로 보여주는 기능 개발해서 5000포트에 반영했습니다1. " +
        "모바일쪽에서 채팅목록 보여줄때 마지막 스티커를 (sticker) 로 보여주는 기능 개발해서 5000포트에 반영했습니다0",
        "writerId": 296,
        "messageId": 493024,
        "topicId": 314,
        "teamId": 279,
        "writtenAt": "2015-06-10T03:25:55.194Z",
        "status": "created",
        "creatorId": 285,
        "createdAt": "2015-06-23T04:05:19.275Z"
      };
      _onGetAnnouncementSuccess(testResponse);
    }

    function _blockEvent(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
})();
