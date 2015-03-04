(function() {
  'use strict';

  describe('Main Filter - parseUrl', _parseUrl);

  function _parseUrl() {
    beforeEach(module('jandiApp'));

    var parseUrlFilter;
    beforeEach(inject(function($filter) {
      parseUrlFilter = $filter('parseUrl');
    }));

    it('should be not null', function() {
      expect(parseUrlFilter).not.toBeNull();
    });

    // JND-846
    it('should be escape', function() {
      var tag = '<',
          tempEscape = '&lt;',
          esc = parseUrlFilter(tag);

      expect(esc).toEqual(tempEscape);

      tag = '>',
      tempEscape = '&gt;',
      esc = parseUrlFilter(tag);

      expect(esc).toEqual(tempEscape);

      tag = '&',
      tempEscape = '&amp;',
      esc = parseUrlFilter(tag);

      expect(esc).toEqual(tempEscape);

      tag = '<slideshare ...>;;;www.tosslab.com',
      tempEscape = '&lt;slideshare ...&gt;;;;<a href="http://www.tosslab.com" target="_blank">www.tosslab.com</a>',
      esc = parseUrlFilter(tag);

      expect(esc).toEqual(tempEscape);
    });

    // JND-586
    it('should be emailto:', function() {
      var emailStr = 'peter.yun@tosslab.co.kr',
          tempEmailStr = '<a href="mailto:' + emailStr + '">' + emailStr + '</a>',
          emailLink = parseUrlFilter(emailStr);

      expect(emailLink).toEqual(tempEmailStr);

      emailStr = 'peter@tosslab.com',
      tempEmailStr = '<a href="mailto:' + emailStr + '">' + emailStr + '</a>',
      emailLink = parseUrlFilter(emailStr);
    
      expect(emailLink).toEqual(tempEmailStr);
    });

    // JND-543
    it('should be uris', function() {
      var uriStr = 'www.tosslab.com',
          tempUriStr = '<a href="http://' + uriStr + '" target="_blank">' + uriStr + '</a>',
          uriLink = parseUrlFilter(uriStr);

      expect(uriLink).toEqual(tempUriStr);

      uriStr = 'tosslab.com';
      uriLink = parseUrlFilter(uriStr);

      expect(uriLink).toEqual(uriStr);
    });

    it('should be urls', function() {
      var urlStr = 'http://www.tosslab.com',
          tempUrlStr = '<a href="' + urlStr + '" target="_blank">' + urlStr + '</a>',
          urlLink = parseUrlFilter(urlStr);

      expect(urlLink).toEqual(tempUrlStr);

      urlStr = 'http://tosslab.jp',
      tempUrlStr = '<a href="' + urlStr + '" target="_blank">' + urlStr + '</a>',
      urlLink = parseUrlFilter(urlStr);

      expect(urlLink).toEqual(tempUrlStr);
    });
  }

})();