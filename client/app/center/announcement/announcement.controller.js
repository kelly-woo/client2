(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('AnnouncementCtrl', AnnouncementCtrl);

  /* @ngInject */
  function AnnouncementCtrl($scope, Announcement, entityAPIservice, memberService, config) {

    var _topicType;
    var _topicId;

    $scope.hasAnnouncement = false;
    $scope.displayStatus = {
      hide: false,
      minimized: false
    };


    $scope.onAnnouncementArrowClicked = onAnnouncementArrowClicked;
    $scope.onHidedAnnouncementClicked = onHidedAnnouncementClicked;

    $scope.isAnnouncementHided = isAnnouncementHided;
    $scope.isAnnouncmentMinimized = isAnnouncementMinimized;

    $scope.deleteAnnouncement = deleteAnnouncement;
    $scope.hideAnnouncement = hideAnnouncement;

    _init();

    /**
     * 초기화 함수.
     * @private
     */
    function _init() {
      _topicId = $scope.entityId;
      _topicType = $scope.entityType;

      _getAnnouncement();

      //test();
      testWithLink();
    }

    /**
     * 현재 토픽의 announcement 를 불러온다.
     * @private
     */
    function _getAnnouncement() {
      Announcement.getAnnouncement(_topicId)
        .success(_onGetAnnouncementSuccess)
        .error(_onGetAnnouncementError);

    }

    /**
     * announcement 를 가져오기에 성공했을 때!
     * @param {object} announcement - server 로 부터 온 response
     * @private
     */
    function _onGetAnnouncementSuccess(announcement) {
      var announcementOwner;

      if (_.isEmpty(announcement)) {
        console.log('announcement is empty!');
      } else {
        announcementOwner = entityAPIservice.getEntityFromListById($scope.memberList, announcement.writerId);

        $scope.announcementOwner = {
          'profilePic':  config.server_uploaded + memberService.getSmallThumbnailUrl(announcementOwner),
          'name': announcementOwner.name,
          'time': announcement.writtenAt
        };

        $scope.announcementBody = Announcement.getFilteredContentBody(announcement.content);
        _showAnnouncement();
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
     * announcement 우측 상단에 있는 화살표를 눌렀을 경우
     */
    function onAnnouncementArrowClicked() {
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
      console.log('onHidedAnnouncementClicked');
      maximizeAnnouncement();
    }

    /**
     * announcement 의 visible status 를 true 로 바꿔준다.
     * @private
     */
    function _showAnnouncement() {
      $scope.hasAnnouncement = true;
    }

    /**
     * announcement dom element를 삭제한다.
     * @private
     */
    function _detachAnnouncement() {
      Announcement.removeAnnouncement();
    }

    /**
     * announcement 를 minimized 상태로 바꿔준다.
     * @private
     */
    function maximizeAnnouncement() {
      $scope.displayStatus.hide = false;
      $scope.displayStatus.minimized = false;
    }

    /**
     * announcement 를 extended 상태로 바꿔준다.
     * @private
     */
    function minimizeAnnouncement() {
      $scope.displayStatus.hide = false;
      $scope.displayStatus.minimized = true;
    }

    function isAnnouncementHided() {
      return $scope.displayStatus.hide;
    }
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
    function deleteAnnouncement() {
      console.log('delete announcement')
    }

    function test() {
      var testResponse = {
        "content": "모바일쪽에서 채팅목록 보여줄때 마지막 스티커를 (sticker) 로 보여주는 기능 개발해서 5000포트에 반영했습니다.",
        "writerId": 296,
        "messageId": 493024,
        "topicId": 314,
        "teamId": 279,
        "writtenAt": "2015-06-10T03:25:55.194Z",
        "status": "created"
      };

      _onGetAnnouncementSuccess(testResponse);
    }

    function testWithLink() {
      var testResponse = {
        "content": "의자 http://shopping.naver.com/detail/detail.nhn?query=%EB%93%80%EC%98%A4%EB%B0%B1%20%EC%82%AC%EB%AC%B4%EC%9A%A9%EC%9D%98%EC%9E%90&cat_id=50003683&nv_mid=7885019416&frm=NVSCPRO",
        "writerId": 296,
        "messageId": 493024,
        "topicId": 314,
        "teamId": 279,
        "writtenAt": "2015-06-10T03:25:55.194Z",
        "status": "created"
      };
      _onGetAnnouncementSuccess(testResponse);
    }

  }
})();
