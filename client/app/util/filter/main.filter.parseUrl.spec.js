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