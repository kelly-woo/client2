/**
 * @fileoverview 팝업 관리 서비스
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandi.popup')
    .service('Popup', Popup);

  /* @ngInject */
  function Popup() {
    var _popupMap = {};
    var _closeWithParentMap = {};
    var _id = 0;

    this.get = get;
    this.open = open;
    this.close = close;
    this.closeAll = closeAll;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
      $(window).on('unload', closeAll);
    }

    /**
     * name 에 해당하는 popup 을 반환한다.
     * @param {string} [name]
     * @returns {*}
     */
    function get(name) {
      var target;
      if (_.isString(name)) {
        target = _popupMap[name];
      } else {
        target = _popupMap;
      }
      return target;
    }

    /**
     * popup 을 오픈한다.
     * @param {string} url  - open 할 대상 url
     * @param {object} options
     *    @param {string} [options.name]  - 팝업 이름
     *    @param {string} [options.optionStr='']  - popup 옵션 스트링
     *    @param {boolean} [options.useReload=true]   - 새로고침 할 것인지 여부
     *    @param {boolean} [options.closeWithParent=true]   - 부모 창이 닫힐 때 함께 닫힐것인지 여부
     *    @param {object} [options.data=true]   - popup open 과 함께 전달할 데이터
     *    @param {string} [options.method='get']  - 현재 GET 만 지원함. 추후 필요시 post 지원하도록 수정 필요.
     *
     */
    function open(url, options) {
      var popup;
      var name;

      options = _.extend({
        name: 'popup_' + _createUniqueId(),
        optionStr: '',
        useReload: true,
        closeWithParent: true,
        method: 'get',
        data: {}
      }, options);
      name = options.name;

      _popupMap[name] = popup = _open(url, options);

      if (options.closeWithParent) {
        _closeWithParentMap[name] = popup;
      }

      if (!popup || popup.closed || _.isUndefined(popup.closed)) {
        alert('브라우저에 팝업을 막는 기능이 활성화 상태이기 때문에 서비스 이용에 문제가 있을 수 있습니다. 해당 기능을 비활성화 해 주세요');
      }
    }

    /**
     * 팝업을 닫는다.
     * @param {object} [popup] - close 할 대상 popup. 생략시 현재  window
     */
    function close(popup) {
      var target = popup || window;
      var name;
      if (!target.closed) {
        name = _getName(target);
        if (name) {
          //확실한 메모리 해제를 위해 null 할당과 delete 연산 둘 다 한다.
          _popupMap[name] = null;
          _closeWithParentMap[name] = null;
          delete _popupMap[name];
          delete _closeWithParentMap[name];
        }
        target.opener = window.location.href;
        target.close();
      }
    }

    /**
     * 열린 모든 팝업을 닫는다.
     */
    function closeAll() {
      _.each(_closeWithParentMap, function(popup) {
        close(popup);
      });
    }

    /**
     * popup 을 오픈한다.
     * @param {string} url  - open 할 대상 url
     * @param {object} options
     *    @param {string} [options.name]  - 팝업 이름
     *    @param {string} [options.optionStr='']  - popup 옵션 스트링
     *    @param {boolean} [options.useReload=true]   - 새로고침 할 것인지 여부
     *    @param {boolean} [options.closeWithParent=true]   - 부모 창이 닫힐 때 함께 닫힐것인지 여부
     *    @param {object} [options.data=true]   - popup open 과 함께 전달할 데이터
     *    @param {string} [options.method='get']  - 현재 GET 만 지원함. 추후 필요시 post 지원하도록 수정 필요.
     *
     */
    function _open(url, options) {
      var popup;
      var name = options.name;

      popup = _popupMap[name];

      if (!popup) {
        popup = window.open(_getFullUrl(url, options.data), name, options.optionStr);
      } else {
        if (popup.closed) {
          popup = window.open(_getFullUrl(url, options.data), name, options.optionStr);
        } else {
          if (options.useReload) {
            popup.location.replace(_getFullUrl(url, options.data));
          }
          popup.focus();
        }
      }
      return popup;
    }

    /**
     * query 를 포함한 전체 url 을 반환한다.
     * @param {string} url - url
     * @param {object} data - 데이터
     * @returns {string}
     * @private
     */
    function _getFullUrl(url, data) {
      if (!_.isEmpty(data)) {
        url = url + (/\?/.test(url) ? '&' : '?') + _parameterize(data);
      }
      return url;
    }

    /**
     * popup 객체로 부터 popup name 을 반환한다.
     * @param {object} popup
     * @returns {*}
     * @private
     */
    function _getName(popup) {
      var target;
      _.each(_popupMap, function(item) {
        if (popup === item) {
          target = item;
          return false;
        }
      });
      return target;
    }

    /**
     * popup name 을 위한 unique 한 id 를 반환한다.
     * @returns {number}
     * @private
     */
    function _createUniqueId() {
      return _id++;
    }

    /**
     * data object 를 query string 으로 반환한다.
     * @param {object} data
     * @returns {string}
     * @private
     */
    function _parameterize(data) {
      var queryList = [];
      _.each(data, function(value, key) {
        queryList.push(key + '=' + encodeURIComponent(value));
      });
      return queryList.join('&');
    }
  }
})();
