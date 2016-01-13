(function() {
  'use strict';

  angular
    .module('app.router')
    .service('Router', Router);

  /* @ngInject */
  function Router($state, entityAPIservice, currentSessionHelper, $rootScope, fileAPIservice, configuration,
                  NetInterceptor, storageAPIservice, jndPubSub, JndConnect) {

    this.onStateChangeStart = onStateChangeStart;
    this.onRouteChangeError = onRouteChangeError;
    this.onStateNotFound = onStateNotFound;
    this.onLocationChangeSuccess = onLocationChangeSuccess;

    this.getActiveRightTabName = getActiveRightTabName;

    function onRouteChangeError(event, current, previous, rejection) {
      $state.go('messages.home');
    }

    function onStateNotFound(event, unfoundState, fromState, fromParams) {
      console.info("==============================[stateNotFound]==============================");
      console.info("   to", unfoundState.to); // "lazy.state"
      console.info("   toParams", unfoundState.toParams); // {a:1, b:2}
      console.info("   options", unfoundState.options); // {inherit:false} + default options
      console.info("===========================================================================");
    }

    function onLocationChangeSuccess(event) {
      entityAPIservice.setLastEntityState();
    }

    /**
     * $stateChangeStart 이벤트 발생시 핸들러
     * @param {object} toState
     * @param {object} toParams
     * @param {object} fromState
     * @param {object} fromParams
     * @private
     */
    function onStateChangeStart(event, toState, toParams, fromState, fromParams) {
      if (!NetInterceptor.isConnected()) {
        event.preventDefault();
      } else if (_isStateChange(toState, toParams, fromState, fromParams)) {
        //console.info("==============================[stateChange]==============================");
        //console.info("   from    ", fromState.name, ' / ', fromParams);
        //console.info("    to     ", toState.name, ' / ',toParams);
        //console.info("=========================================================================");

        if (currentSessionHelper.isMobile && toState.name != 'mobile') {
          if (toState.name == "password") {
            return;
          }
          else if (storageAPIservice.getAccessToken()) {
            event.preventDefault();
            $state.go('mobile');
          }
        }

        // otherwise, internal access, redirect to messages state
        switch (toState.name) {
          case 'signin':
            break;
          case 'archives':
            var archivesListType;

            event.preventDefault();
            if (archivesListType = /messages.detail.([a-z]+)/i.exec(fromState.name)) {
              if (fromParams.itemId) {
                // file detail view
                $state.go('messages.detail.' + archivesListType[1] + '.item', _.extend(toParams, {"itemId": fromParams.itemId}));
              } else {
                // file list view
                $state.go('messages.detail.' + archivesListType[1], toParams);
              }
            } else {
              $state.go('messages.detail', toParams);
            }
            break;
          case 'files':
            if (fromState.name === '') {
              // fromState name이 없고 toState name이 files 일때(/files/ uri에 direct로 접근하는 경우) $state 로직상 계속 해서 request를 전달하여
              // browser가 멈추는 현상이 발생 하므로 이경우 toParam에 포함된 message id로 특정 file의 fileUrl로 redirect 하도록 처리함.
              fileAPIservice.getFileDetail(toParams.itemId)
                .success(function (response) {
                  var msgs;
                  var msg;
                  var url;
                  var i;
                  var len;

                  if (response) {
                    msgs = response.messageDetails;
                    for (i = msgs.length - 1; i > -1; --i) {
                      msg = msgs[i]
                      if (msg.contentType === 'file') {
                        url = msg.content.fileUrl;
                        location.href = /^[http|https]/.test(url) ? url : configuration.api_address + url;
                        break;
                      }
                    }
                  }
                })
                .error(function (err) {
                  console.error(err.msg);
                });
              return;
            } else {
              event.preventDefault();
              jndPubSub.pub('onActiveHeaderTab', 'files');
              $state.transitionTo('messages.detail.files.redirect', _.extend({tail: 'files'}, fromParams, toParams));
            }
            break;
          case 'stars':
            event.preventDefault();
            jndPubSub.pub('onActiveHeaderTab', 'stars');
            $state.transitionTo('messages.detail.stars.redirect', _.extend({tail: 'stars'}, fromParams, toParams));
            break;
          case 'mentions':
            event.preventDefault();
            jndPubSub.pub('onActiveHeaderTab', 'mentions');
            $state.transitionTo('messages.detail.mentions.redirect', _.extend({tail: 'mentions'}, fromParams, toParams));
            break;
          case 'messages' :
          case 'messages.home' :
            var lastState = entityAPIservice.getLastEntityState();

            // If lastState doesn't exist.
            // Direct user to default channel.
            if (!lastState || angular.isUndefined(entityAPIservice.getEntityById(lastState.entityType, lastState.entityId))) {
              entityAPIservice.removeLastEntityState();
              $rootScope.toDefault = true;
              return;
            }

            event.preventDefault();

            if (lastState.rpanel_visible) {
              if (lastState.itemId) {
                $state.go('messages.detail.files.item', {
                  entityType: lastState.entityType,
                  entityId: lastState.entityId,
                  itemId: lastState.itemId
                });
                return;
              }
              $state.go('messages.detail.files', {entityType: lastState.entityType, entityId: lastState.entityId});
            }
            else {
              $state.go('messages.detail', {entityType: lastState.entityType, entityId: lastState.entityId});
            }

            break;
          case 'messages.detail.files':
          case 'messages.detail.messages':
          case 'messages.detail.stars':
          case 'messages.detail.mentions':
            jndPubSub.pub('rightPanelStatusChange', {
              type: getActiveRightTabName(toState),
              toUrl: toState.url,
              toTitle: toState.title,
              fromUrl: fromState.url,
              fromTitle: fromState.title
            });
            break;
          case '404':
            event.preventDefault();
            $state.go('notfound');
            break;
          default:
            break;
        }

        if (!event.defaultPrevented) {
          _setCurrentEntityWithTypeAndId(toParams.entityType, toParams.entityId);
        }
      }
    }

    /**
     * state 가 변경되었는지 여부를 반환한다.
     * @param {object} toState
     * @param {object} toParams
     * @param {object} fromState
     * @param {object} fromParams
     * @returns {boolean}
     * @private
     */
    function _isStateChange(toState, toParams, fromState, fromParams) {
      _.each(toParams, function(value, key) {
        if (_.isString(value)) {
          toParams[key] = value.toLowerCase();
        }
      });
      _.each(fromParams, function(value, key) {
        if (_.isString(value)) {
          fromParams[key] = value.toLowerCase();
        }
      });

      return !(fromState.name === toState.name && _.isEqual(fromParams, toParams));
    }

    /**
     * $rootScope에 있는 currentEntity를 업데이트해준다.
     * @param entityType {string} 엔티티의 타입
     * @param entityId {string 혹은 number} 엔티티의 아이디
     * @private
     */
    function _setCurrentEntityWithTypeAndId(entityType, entityId) {
      entityAPIservice.setCurrentEntityWithTypeAndId(entityType, entityId);
    }

    /**
     * state로 active 되야할 right panel의 tab name을 전달함.
     * @param {object} currentState
     * @returns {Array|{index: number, input: string}|*}
     */
    function getActiveRightTabName(currentState) {
      var match = /messages.detail.([a-z]+)/i.exec(currentState.name);
      return match && match[1];
    }
  }
})();
