/**
 * @fileoverview Tutorial C 패널 메세지 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialMessages', TutorialMessages);

  /* @ngInject */
  function TutorialMessages($filter, TutorialEntity, TutorialAccount) {
    var _list = [];
    var _name;
    var _profileUrl;

    this.clear = clear;
    this.set = set;
    this.get = get;
    this.getBaseMessage = getBaseMessage;
    this.prepend = prepend;
    this.append = append;
    this.restore = restore;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
      var account;
      TutorialAccount.promise.then(function() {
        account = TutorialAccount.getCurrent();
        _name = account.name;
        _profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);
        restore();
      });
    }

    /**
     * list 를 설정한다.
     * @param {array} list
     */
    function set(list) {
      clear();
      _.forEach(list, function(message) {
        _list.push(message);
      });
    }

    /**
     * 값을 조회한다.
     * @returns {Array}
     */
    function get() {
      return _list;
    }

    /**
     * list 값을 [] 로 만든다.
     */
    function clear() {
      while (_list.length > 0) {
        _list.pop();
      }
    }

    /**
     * messages 를 앞에 붙인다.
     * @param {Array|Object} messages
     */
    function prepend(messages) {
      messages = _.isArray(messages) ? messages : [messages];
      _.forEachRight(messages, function(message) {
        _list.unshift(message);
      });
    }

    /**
     * messages 를 뒤에 붙인다.
     * @param {Array|Object} messages
     */
    function append(messages) {
      messages = _.isArray(messages) ? messages : [messages];
      _.forEach(messages, function(message) {
        _list.push(message);
      });
    }

    /**
     * messages 를 default 값으로 되돌린다.
     */
    function restore() {
      clear();
      _list.push(getBaseMessage('date'));
    }

    /**
     * contentType 에 따라 기본 포멧의 메세지 데이터를 반환한다.
     * @param {'date'|'file'|'sticker'|'text'} contentType
     * @returns {*}
     */
    function getBaseMessage(contentType) {
      var data = null;
      switch (contentType) {
        case 'date':
          data = {
            contentType: 'date',
            date: _getDate()
          };
          break;
        case 'file':
          data = {
            contentType: 'file',
            profileUrl: _profileUrl,
            name: _name,
            content: {
              title: 'JANDI UPDATE',
              type: 'image/vnd.adobe.photoshop',
              ext: 'psd',
              size: 2048
            },
            shared: [
              {name: TutorialEntity.get('name')}
            ],
            time: (new Date()).getTime(),
            unreadCount: 1
          };
          break;
        case 'sticker':
          data = {
            contentType: 'sticker',
            profileUrl: _profileUrl,
            name: _name,
            content: 'https://jandi-box.com/files-sticker/100/11',
            time: (new Date()).getTime(),
            unreadCount: 1
          };
          break;
        case 'text':
          data = {
            contentType: 'text',
            profileUrl: _profileUrl,
            name: _name,
            content: 'message',
            time: (new Date()).getTime()
          };
          break;
      }
      return data;
    }

    /**
     * 날짜 문자열를 반환한다.
     * @param {number} time
     * @returns {string}
     * @private
     */
    function _getDate(time) {
      time = time || (new Date()).getTime();
      return $filter('ordinalDate')(time, "EEEE, MMMM doo, yyyy");
    }
  }
})();
