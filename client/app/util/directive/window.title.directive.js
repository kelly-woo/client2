/**
 * Browser tab에 title을 상황에 맞게 설정한다.
 */
(function() {
  'use strict';

  angular.
    module('jandiApp')
    .directive('windowTitleManager', windowTitleManager);

  /* @ngInject */
  function windowTitleManager(currentSessionHelper, NotificationManager) {

    return {
      restrict: 'A',
      scope: false,
      link: link
    };

    function link(scope, el, attrs) {
      var _teamName;
      var _topicName;
      var _hasAsterisk = false;
      var _hasNotificationFavicon = false;

      _attachEventListener();

      /**
       * 현재 스코프에 이벤트 리스너를 단다.
       * @private
       */
      function _attachEventListener() {
        scope.$on('onCurrentEntityChanged', onCurrentEntityChanged);
        scope.$on('addAsteriskToTitle', _setTitleWithAsterisk);
        scope.$on('updateWindowTitle', _updateTitle);
        scope.$on('onBadgeCountChanged', _updateTitle);
      }

      function onCurrentEntityChanged() {
        _updateTitle();
      }
      /**
       * 타이틀을 업데이트한다.
       * @private
       */
      function _updateTitle() {
        _topicName = _getCurrentName();

        if (NotificationManager.hasNotificationAfterFocus()) {
          _setTitleWithAsterisk();
        } else {
          _setTitle(_topicName);
          _hasAsterisk = false;
        }
        _setFavicon();
      }

      /**
       * browser tab영역에 text를 설정한다.
       * @param {string} title - 새로운 타이틀
       * @private
       */
      function _setTitle(title) {
        document.title = _getTitle(title);
      }

      /**
       * 현재 타이틀 맨 앞에  '*'를 추가한다.
       * @private
       */
      function _setTitleWithAsterisk() {
        if (!_hasAsterisk) {
          _topicName = _getCurrentName();
          _setTitle('* ' + _topicName);
          _hasAsterisk = true;
        }
      }

      /**
       * 현재 팀의 이름을 가져온다.
       * 토픽 이름이 없으면 팀 이름을
       * 팀 이름이 없으면  Toss Lab Inc. 를 리턴한다.
       * @returns {Window.name|*}
       * @private
       */
      function _getCurrentName() {
        var _currentTopicName;
        var _currentTeam;
        var _currentEntity = currentSessionHelper.getCurrentEntity();

        if (!!_currentEntity) {
          _currentTopicName = _currentEntity.name;
        } else {
          _currentTeam = currentSessionHelper.getCurrentTeam();

          if (!!_currentTeam) {
            _currentTopicName = _currentTeam.name;
          } else {
            _currentTopicName = 'Toss Lab Inc.';
          }
        }

        return _currentTopicName;
      }

      /**
       * topic이름 | 팀이름 포맷을 리턴한다.
       * @param {string} title - topic이름에 해당하는 부분
       * @returns {string}
       * @private
       */
      function _getTitle(title) {
        if (_.isUndefined(_teamName)) {
          _teamName = currentSessionHelper.getCurrentTeam().name;
        }
        return title + ' | ' + _teamName;
      }


      /**
       * 안 읽은 메세지가 있나없나에 따라서 favicon을 교체한다.
       * @private
       */
      function _setFavicon() {
        var link = document.getElementsByTagName('link')[0];

        if (NotificationManager.hasNotification()) {
          // 새로운 노티피케이션(뱃지카운트)가 있을 때
          if (!_hasNotificationFavicon) {
            link.href ='../assets/images/favicon/favicon_noti.png';
            _hasNotificationFavicon = true;
          }
        } else {
          // 새로운 노티피케이션(뱃지카운트)가 없을 때
          if(_hasNotificationFavicon) {
            link.href = '../assets/images/favicon/favicon.png';
            _hasNotificationFavicon = false;
          }
        }
      }

    }
  }
})();
