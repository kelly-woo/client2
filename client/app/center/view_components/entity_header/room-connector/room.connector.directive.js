/**
 * @fileoverview room connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('roomConnector', roomConnector);

  /* @ngInject */
  function roomConnector($filter, JndConnect, entityAPIservice) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectInfo: '='
      },
      templateUrl : 'app/center/view_components/entity_header/room-connector/room.connector.html',
      link: link
    };

    function link(scope) {
      var clearWatch;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onConnectSetting = onConnectSetting;
        scope.onConnectDelete = onConnectDelete;
        scope.onConnectAddClick = onConnectAddClick;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('connectInfo', _onConnectInfoChange);

        scope.$on('webSocketConnect:connectCreated', _onConnectCreated);
        scope.$on('webSocketConnect:connectUpdated', _onConnectUpdated);
        scope.$on('webSocketConnect:connectDeleted', _onConnectDeleted);
        scope.$on('updateMemberProfile', _onMemberProfileUpdated);
      }

      /**
       * connect info change event handler
       * @private
       */
      function _onConnectInfoChange(connectInfo) {
        _setConnectInfo(connectInfo);
      }

      /**
       * connect created event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onConnectCreated(angularEvent, data) {
        _addConnectPlug(data.connect.type, data.connect);
      }

      /**
       * connect updated event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onConnectUpdated(angularEvent, data) {
        _updateConnectPlug(function(connectPlug) {
          var bot;
          if (connectPlug.connectId === data.connect.id) {
            bot = entityAPIservice.getEntityById('total', data.bot.id);
            connectPlug.botName = bot.name;
            connectPlug.botProfileImage = bot.thumbnailUrl;

            connectPlug.status = data.connect.status;
          }
        });
      }

      /**
       * connect deleted event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onConnectDeleted(angularEvent, data) {
        _removeConnectPlug(data.connect.id);
      }

      /**
       * member profile updated event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onMemberProfileUpdated(angularEvent, data) {
        _updateConnectPlug(function(connectPlug) {
          var member;
          if (connectPlug.memberId === data.member.id) {
            member = entityAPIservice.getEntityById('total', data.member.id);
            connectPlug.memberName = member.name;
          }
        });
      }

      /**
       * setting connect
       * @param {number} connectId
       */
      function onConnectSetting(connectId, unionName) {
        _openConnectSetting(connectId, unionName);
      }

      /**
       * delete connect
       * @param {object} angularEvent
       * @param {object} connectId
       * @private
       */
      function onConnectDelete(connectId) {
        // jnd-connect-trash-button directive에서 삭제 request를 하므로 view list에서 item만 제거한다.
        _removeConnectPlug(connectId);
      }

      /**
       * connect add click
       */
      function onConnectAddClick() {
        // connect 메인 페이지를 연다.
        JndConnect.open();
      }

      /**
       * open connect setting page
       * @private
       */
      function _openConnectSetting(connectId, unionName) {
        // 해당 connect에 대한 설정 페이지를 연다.
        JndConnect.open({
          connectId: connectId,
          unionName: unionName
        });
      }

      /**
       * init connect info
       * @private
       */
      function _initConnectInfo() {
        clearWatch && clearWatch();
        scope.connectPlugs = [];
      }

      /**
       * request success
       * @param {object} connectInfo
       * @private
       */
      function _setConnectInfo(connectInfo) {
        if (_.isEmpty(connectInfo)) {
          scope.isInitialized = false;

          _initConnectInfo();
        } else {
          scope.isInitialized = true;

          _.each(connectInfo, function(connects, name) {
            _.each(connects, function(connect) {
              _addConnectPlug(name, connect);
            });
          });

          _setConnectContent();

          clearWatch = scope.$watch('connectPlugs.length', _setConnectContent);
        }
      }

      /**
       * add connect
       * @param {object} connect
       * @private
       */
      function _addConnectPlug(name, connect) {
        var member = entityAPIservice.getEntityById('total', connect.memberId);
        var bot = entityAPIservice.getEntityById('total', connect.botId);

        if (member && bot) {
          scope.connectPlugs.push({
            botProfileImage: bot.thumbnailUrl,
            botName: bot.name,
            memberName: member.name,
            status: connect.status,

            unionName: name,
            connectId: connect.id,
            memberId: connect.memberId,
            botId: connect.botId
          });
        }
      }

      /**
       * update connect
       * @private
       */
      function _updateConnectPlug(fn) {
        _.each(scope.connectPlugs, fn);
      }

      /**
       * remove connect
       * @param {object} connect
       * @private
       */
      function _removeConnectPlug(connectId) {
        var index = _.findIndex(scope.connectPlugs, 'connectId', connectId);

        if (index > -1) {
          scope.connectPlugs.splice(index, 1);
        }
      }

      /**
       * connect plug가 존재하거나 아니거나에 따라 출력되는 상태를 설정함
       * @private
       */
      function _setConnectContent() {
        var translate = $filter('translate');
        scope.hasConnectPlugs = scope.connectPlugs.length > 0;

        if (scope.hasConnectPlugs) {
          scope.connectCount = scope.connectPlugs.length;
          scope.connectStatusDesciption = translate('@jnd-connect-222').replace('{{connectCount}}', scope.connectCount);
          scope.connectButtonText = translate('@jnd-connect-8');
        } else {
          scope.connectCount = 0;
          scope.connectStatusDesciption = translate('@jnd-connect-220');
          scope.connectButtonText = translate('@jnd-connect-14');
        }
      }
    }
  }
})();
