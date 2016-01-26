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
        connectInfo: '=',
        onDropdownToggle: '&'
      },
      templateUrl : 'app/center/view_components/entity_header/room-connector/room.connector.html',
      link: link
    };

    function link(scope) {
      // removedConnectPlugs가 존재하는 이유는 connect가 삭제 되었을때 즉각 UI에 반응하기 위함이다
      // client에서 삭제 요청된 connect plug가 server에서 삭제 완료되지 않은 경우
      // client에서 connect plug에 대한 정보 요청시 삭제 요청된 connect plug가 전달되기 때문에
      // 따라 삭제된 connect plug를 관리하도록 한다.
      var removedConnectPlugs = [];
      var connectPlugMap;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onConnectSetting = onConnectSetting;
        scope.onConnectDelete = onConnectDelete;
        scope.onConnectAddClick = onConnectAddClick;
        scope.onToggle = onToggle;

        _initConnectPlugs();

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('connectInfo', _onConnectInfoChange);
        scope.$watch('connectPlugs.length', _setConnectContent);

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
        _setConnect(connectInfo);
      }

      /**
       * connect created event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onConnectCreated(angularEvent, data) {
        _setConnectPlug(data.connect.type, data.connect, true);
      }

      /**
       * connect updated event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onConnectUpdated(angularEvent, data) {
        _.each(scope.connectPlugs, function(connectPlug) {
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
        _.each(scope.connectPlugs, function(connectPlug) {
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
       * dropdown menu toggle event handler
       * @param {boolean} isOpen
       */
      function onToggle(isOpen) {
        scope.onDropdownToggle({
          $isOpen: isOpen
        });
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
       * connect 상태 및 plug item 설정
       * @param {object} connectInfo
       * @private
       */
      function _setConnect(connectInfo) {
        if (_.isEmpty(connectInfo)) {
          scope.isInitialized = false;

          _initConnectPlugs();
        } else {
          scope.isInitialized = true;

          _initConnectPlugs(connectInfo);
          _setConnectContent();
        }
      }

      /**
       * init connect plugs
       * @private
       */
      function _initConnectPlugs(connectInfo) {
        var setList;

        if (!connectInfo) {
          connectPlugMap = {};
          scope.connectPlugs = [];
          removedConnectPlugs = [];
        } else {
          setList = {};

          _.each(connectInfo, function(connects, name) {
            _.each(connects, function(connect) {
              setList[connect.id] = true;
              _setConnectPlug(name, connect);
            });
          });

          _.each(scope.connectPlugs, function(connectPlug) {
            if (setList[connectPlug.connectId] == null) {
              // 현재 생성된 connect plug가 새로 설정될 connectInfo에
              // 존재하지 않는다면 해당 connect plug를 삭제한다.
              _removeConnectPlug(connectPlug.connectId);
            }
          });
        }
      }

      /**
       * set connect plug
       * @param {string} name
       * @param {object} connect
       * @param {boolean} force - remove connect plug를 확인하지 않고 강제설정 여부
       * @private
       */
      function _setConnectPlug(name, connect, force) {
        var member;
        var bot;
        var connectPlug;
        var index;

        if (force || removedConnectPlugs.indexOf(connect.id) < 0) {
          // 삭제되었던 connect plug가 아님
          
          member = entityAPIservice.getEntityById('total', connect.memberId);
          bot = entityAPIservice.getEntityById('total', connect.botId);
          if (member && bot) {
            if (connectPlug = connectPlugMap[connect.id]) {
              // 이전에 설정된 connect plug가 존재한다면 connect plug를 갱신한다.
              _updateConnectPlug(name, connect, bot, member, connectPlug);
            } else {
              // 이전에 설정된 connect plug가 존재하지 않는다면 connect plug를 추가한다.
              _addConnectPlug(name, connect, bot, member);
            }
          }

          index = removedConnectPlugs.indexOf(connect.id);
          if (index > -1) {
            removedConnectPlugs.splice(index, 1);
          }
        }
      }

      /**
       * update connect plug
       * @param {string} name
       * @param {object} connect
       * @param {object} bot
       * @param {object} member
       * @param {object} target
       * @private
       */
      function _updateConnectPlug(name, connect, bot, member, target) {
        target.botProfileImage = bot.thumbnailUrl;
        target.botName = bot.name;
        target.memberName = member.name;
        target.status = connect.status;
        target.sourceName = JndConnect.getPlugSourceName(name, connect);
      }

      /**
       * add connect plug
       * @param {string} name
       * @param {object} connect
       * @param {object} bot
       * @param {object} member
       * @private
       */
      function _addConnectPlug(name, connect, bot, member) {
        var connectPlug = {
          botProfileImage: bot.thumbnailUrl,
          botName: bot.name,
          memberName: member.name,
          status: connect.status,
          sourceName: JndConnect.getPlugSourceName(name, connect),
          unionName: name,
          connectId: connect.id,
          memberId: connect.memberId,
          botId: connect.botId
        };

        scope.connectPlugs.push(connectPlug);
        connectPlugMap[connectPlug.connectId] = connectPlug;
      }

      /**
       * remove connect
       * @param {object} connect
       * @private
       */
      function _removeConnectPlug(connectId) {
        var index = _.findIndex(scope.connectPlugs, 'connectId', connectId);

        if (index > -1) {
          removedConnectPlugs.push(connectId);
          scope.connectPlugs.splice(index, 1);
          delete connectPlugMap[connectId];
        }
      }

      /**
       * connect plug가 존재하거나 아니거나에 따라 출력되는 상태를 설정함
       * @private
       */
      function _setConnectContent() {
        var translate;

        if (scope.isInitialized) {
          translate = $filter('translate');
          scope.hasConnectPlugs = scope.connectPlugs.length > 0;

          if (scope.hasConnectPlugs) {
            scope.connectCount = scope.connectPlugs.length;
            scope.connectStatusDesciption = translate('@jnd-connect-222').replace('{{connectCount}}', scope.connectCount);
            scope.connectButtonText = translate('@jnd-connect-8');
          } else {
            scope.connectCount = '';
            scope.connectStatusDesciption = translate('@jnd-connect-220');
            scope.connectButtonText = translate('@jnd-connect-14');
          }
        }
      }
    }
  }
})();
