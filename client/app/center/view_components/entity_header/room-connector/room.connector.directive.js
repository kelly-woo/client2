/**
 * @fileoverview room connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('roomConnector', roomConnector);

  /* @ngInject */
  function roomConnector($state, RoomConnector) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
      },
      templateUrl : 'app/center/view_components/entity_header/room-connector/room.connector.html',
      link: link
    };

    function link(scope, el) {
      var roomId = $state.params.entityId || $state.params.roomId;
      var clearWatch;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('isConnectBoxOpen', _onIsConnectBoxOpenChange);
        scope.$on('connectPlug:connectDelete', _onConnectDelete);
      }

      function _onIsConnectBoxOpenChange(isOpen) {
        if (isOpen) {
          _requestRoomConnectInfo();
        }
      }

      function _onConnectDelete(angularEvent, connectId) {
        var index = _.findIndex(scope.connectPlugs, {id: connectId});
        scope.connectPlugs.splice(index, 1);
      }

      function _initConnectInfo() {
        clearWatch && clearWatch();
        scope.connectPlugs = [];
        scope.isInitialized = false;
      }

      function _requestRoomConnectInfo() {
        _initConnectInfo();

        RoomConnector.getConnectInfo(roomId)
          .success(_successRoomConnectInfo)
          .finally(_finallyRoomConnectInfo);
      }

      function _successRoomConnectInfo(data) {
        return;
        var temp = {
          "google_calendar": [
            {
              "newEventNotification":true,
              "updatedEventNotification":true,
              "cancelledEventNotification":true,
              "createdAt":"2015-12-14T10:01:26.811Z",
              "updatedAt":null,
              "hasWeeklyScheduleSummary":true,
              "hasDailyScheduleSummary":true,
              "hasAllDayNotification":true,
              "hasNotificationBefore":true,
              "authId":11233500,
              "teamId":11186759,
              "memberId":11232644,
              "status":"enabled",
              "roomId":11232773,
              "calendarId":"alex.kim@tosslab.com",
              "calendarSummary":"alex.kim@tosslab.com",
              "timezone":"Asia/Seoul",
              "botId":11234093,
              "lang":"ko",
              "notificationBefore":"4h",
              "allDayNotificationBeforeDates":"2d",
              "allDayNotificationHour":14,
              "dailyScheduleSummary":11,
              "weeklyScheduleSummaryHour":13,
              "weeklyScheduleSummaryDayOfWeek":"TU",
              "id":119
            }
          ],
          "github": [
            {
              "id": 16,
              "hookRepo": "tosslab/toss_server",
              "hookId": 6692298,
              "botId": 11406106,
              "roomId": 510,
              "memberId": 285,
              "teamId": 279,
              "webhookTokenId": 30,
              "connectAuthId": 3,
              "updatedAt": "2015-12-15T13:58:46.124Z",
              "createdAt": "2015-12-15T13:58:46.122Z",
              "hookEvent": [
                "push",
                "commit_comment"
              ],
              "hookBranch": [
                "develop",
                "feature/connect"
              ],
              "lang": "ko",
              "status": "enabled"
            }
          ],
          "trello": [],
          "jira": [
            {
              "id": 13,
              "botId": 11406138,
              "roomId": 295,
              "webhookTokenId": 4,
              "memberId": 11153799,
              "teamId": 279,
              "updatedAt": "2015-12-14T04:27:43.510Z",
              "createdAt": "2015-12-14T04:27:43.508Z",
              "lang": "ko",
              "status": "enabled"
            }
          ],
          "incoming": [
            {
              "id": 14,
              "botId": 11406139,
              "roomId": 295,
              "webhookTokenId": 15,
              "memberId": 11153799,
              "teamId": 279,
              "updatedAt": "2015-12-14T07:43:29.622Z",
              "createdAt": "2015-12-14T07:43:29.619Z",
              "lang": "en",
              "status": "enabled"
            }
          ]
        };
        console.log('connect info ::: ', data);

        data = temp;

        _.each(data, function(connects) {
          _.each(connects, function(connect) {
            scope.connectPlugs.push({
              id: connect.id,
              memberId: connect.memberId,
              botId: connect.botId
            });
          });
        });
      }

      function _finallyRoomConnectInfo() {
        //scope.isInitialized = true;

        _setConnectStatus();

        clearWatch = scope.$watch('connectPlugs.length', _setConnectStatus);
      }

      function _setConnectStatus() {
        scope.hasConnectPlugs = scope.connectPlugs.length > 0;

        if (scope.hasConnectPlugs) {
          scope.connectCount = scope.connectPlugs.length;
          scope.connectStatusDesciption = '{{plugCount}}개의 서비스가 연동중입니다.'.replace('{{plugCount}}', scope.connectCount);
          scope.connectButtonText = '연동 항목 추가하기';
        } else {
          scope.connectStatusDesciption = '토픽에 연동된 서비스가 없습니다.';
          scope.connectButtonText = '연동하기';
        }
      }
    }
  }
})();
