//(function() {
//  'use strict';
//
//  describe('Main Filter - parseUrl', _parseUrl);
//
//  function _parseUrl() {
//    beforeEach(module('jandiApp'));
//
//    var parseUrlFilter;
//    beforeEach(inject(function($filter) {
//      parseUrlFilter = $filter('parseUrl');
//    }));
//
//    it('should be not null', function() {
//      expect(parseUrlFilter).not.toBeNull();
//    });
//
//    // JND-846
//    it('should be escape', function() {
//      var tag = '<',
//          tempEscape = '&lt;',
//          esc = parseUrlFilter(tag);
//
//      expect(esc).toEqual(tempEscape);
//
//      tag = '>',
//      tempEscape = '&gt;',
//      esc = parseUrlFilter(tag);
//
//      expect(esc).toEqual(tempEscape);
//
//      tag = '&',
//      tempEscape = '&amp;',
//      esc = parseUrlFilter(tag);
//
//      expect(esc).toEqual(tempEscape);
//
//      tag = '<slideshare ...>;;;www.tosslab.com',
//      tempEscape = '&lt;slideshare ...&gt;;;;<a href="http://www.tosslab.com" target="_blank">www.tosslab.com</a>',
//      esc = parseUrlFilter(tag);
//
//      expect(esc).toEqual(tempEscape);
//    });
//
//    // JND-586
//    it('should be emailto:', function() {
//      var str1 = 'peter.yun@tosslab.co.kr',
//          temp = '<a href="mailto:' + str1 + '">' + str1 + '</a>',
//          strEle = parseUrlFilter(str1);
//
//      expect(strEle).toEqual(temp);
//
//      str1 = 'peter@tosslab.com',
//      temp = '<a href="mailto:' + str1 + '">' + str1 + '</a>',
//      strEle = parseUrlFilter(str1);
//
//      expect(strEle).toEqual(temp);
//    });
//
//    // JND-543
//    it('should be uris', function() {
//      var uriStr = 'www.tosslab.com',
//          tempUriStr = '<a href="http://' + uriStr + '" target="_blank">' + uriStr + '</a>',
//          uriLink = parseUrlFilter(uriStr);
//
//      expect(uriLink).toEqual(tempUriStr);
//
//      uriStr = 'tosslab.com';
//      uriLink = parseUrlFilter(uriStr);
//
//      expect(uriLink).toEqual(uriStr);
//    });
//
//    it('should be urls', function() {
//      var urlStr = 'http://www.tosslab.com',
//          tempUrlStr = '<a href="' + urlStr + '" target="_blank">' + urlStr + '</a>',
//          urlLink = parseUrlFilter(urlStr);
//
//      expect(urlLink).toEqual(tempUrlStr);
//
//      urlStr = 'http://tosslab.jp',
//      tempUrlStr = '<a href="' + urlStr + '" target="_blank">' + urlStr + '</a>',
//      urlLink = parseUrlFilter(urlStr);
//
//      expect(urlLink).toEqual(tempUrlStr);
//    });
//  }
//
//  describe( 'Main Filter - parseAnchor', _parseAnchor );
//
//  function _parseAnchor () {
//    var parseAnchor,
//
//    beforeEach( module( 'jandiApp' ) );
//    beforeEach( inject( function ( $filter ) {
//      parseAnchor = $filter( 'parseAnchor' );
//    }));
//
//    it( 'should be not null', function () {
//      expect( parseAnchor ).not.toBeNull();
//    });
//
//    // JND-846
//    it( 'should be escape', function () {
//      var tag,
//          tempEscape,
//          esc;
//
//      tag = '<>&"';
//      tempEscape = '&lt;&gt;&amp;&quot;&#39;';
//      esc = parseAnchor( tag );
//      expect( esc ).toEqual( tempEscape );
//
//
//      tag = '<slideshare ...>;;;www.tosslab.com',
//      tempEscape = '&lt;slideshare ...&gt;;;;<a href="http://www.tosslab.com" target="_blank">www.tosslab.com</a>',
//      esc = parseAnchor(tag);
//      expect(esc).toEqual(tempEscape);
//    });
//
//    // JND-543
//    it( 'should be uris', function () {
//      var str1,
//          str2,
//          str3,
//          str4,
//          str5,
//          temp,
//          strEle;
//
//      // www.tosslab.com
//      str1 = 'www.tosslab.com';
//      temp = '<a href="http://' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // http://www.tosslab.com/wiki/1팀
//      str1 = 'http://www.tosslab.com/wiki/1팀'
//      temp = '<a href="' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 http://www.tosslab.com/wiki/1팀
//      str1 = '가나다';
//      str2 = 'http://www.tosslab.com/wiki/1팀';
//      temp = str1 + ' ' + '<a href="' + str2 + '">' + str2 + '</a>';
//      strEle = parseAnchor( str1 + ' ' + str2 );
//      expect( strEle ).toEqual( temp );
//
//      // http://www.tosslab.com/wiki/1팀 라마바
//      str1 = 'http://www.tosslab.com/wiki/1팀';
//      str2 = '라마바';
//      temp = '<a href="' + str1 + '">' + str1 + '</a> ' + str2;
//      strEle = parseAnchor( str1 + ' ' + str2 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 http://www.tosslab.com/wiki/1팀 라마바
//      str1 = '가나다';
//      str2 = 'http://www.tosslab.com/wiki/1팀';;
//      str3 = '라마바';
//      temp = str1 + ' <a href="' + str2 + '">' + str2 + '</a> ' + str3;
//      strEle = parseAnchor( str1 + ' ' + str2 + ' ' + str3 );
//      expect( strEle ).toEqual( temp );
//
//      // http://www.tosslab.com http://www.tosslab.com
//      str1 = 'http://www.tosslab.com'
//      temp =
//        '<a href="' + str1 + '">' + str1 + '</a> <a href="' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 + ' ' + str1 );
//      expect( strEle ).toEqual( temp );
//
//      // http://www.tosslab.com/%ED%93%A8%EB%8B%88%EC%BD%94%EB%93%9C
//      str1 = 'http://www.tosslab.com/%ED%93%A8%EB%8B%88%EC%BD%94%EB%93%9C';
//      temp = '<a href="http://www.tosslab.com/퓨니코드">http://www.tosslab.com/퓨니코드</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // http://www.tosslab.com:8000
//      str1 = 'http://www.tosslab.com:8000';
//      temp = '<a href="' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // JP納豆.例.jp
//      str1 = 'JP納豆.例.jp';
//      temp = '<a href="' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // op.gg
//      str1 = 'op.gg';
//      temp = '<a href="' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // 54.255.183.144
//      str1 = '54.255.183.144';
//      temp = '<a href="' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // 주소 http://www.naver.com 네이버 http://www.daum.net 다음
//      str1 = '주소';
//      str2 = 'http://www.naver.com';
//      str3 = '네이버';
//      str4 = 'http://www.daum.net';
//      str5 = '다음';
//      temp = str1 + ' <a href="' + str2 + '">' + str2 + '</a> ' + str3 + ' <a href="' + str4 + '">' + str4 + '</a> ' + str5;
//      strEle = parseAnchor( str1 + ' ' + str2 + ' ' + str3 + ' ' + str4 + ' ' + str5 );
//      expect( strEle ).toEqual( temp );
//    });
//
//    it( 'should be urls', function () {
//      var str1,
//          temp,
//          strEle;
//
//      str1 = 'www.tosslab.com/image.png';
//      temp = '<a href="http://' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( temp );
//      expect( strEle ).toEqual( temp );
//    });
//    // JND-586
//    it( 'should be emailto:', function () {
//      var str1,
//          str2,
//          str3,
//          temp,
//          strEle;
//
//      // mark.park@tosslab.com
//      str1 = 'mark.park@tosslab.com';
//      temp = '<a href="mailto:' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 mark.park@tosslab.com
//      str1 = '가나다';
//      str2 = 'mark.park@tosslab.com'
//      temp =
//        str1 + ' <a href="mailto:' + str2 + '">' + str2 + '</a>';
//      strEle = parseAnchor( str1 + ' ' + str2 );
//      expect( strEle ).toEqual( temp );
//
//      // mark.park@tosslab.com 라마바
//      str1 = 'mark.park@tosslab.com';
//      str2 = '라마바';
//      temp =
//        '<a href="mailto:' + str1 + '">' + str1 + '</a> ' + str2;
//      strEle = parseAnchor( str1 + ' ' + str2 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 mark.park@tosslab.com 라마바
//      str1 = '가나다';
//      str2 = 'mark.park@tosslab.com';
//      str3 = '라마바';
//      temp = str1 + ' <a href="mailto:' + str2 + '">' + str2 + '</a> ' + str3;
//      expect( strEle ).toEqual( temp );
//
//      // mark.park@tosslab.com mark.park@tosslab.com
//      str1 = 'mark.park@tosslab.com';
//      temp =
//        '<a href="mailto:' + str1 + '">' + str1 + '</a> ' +
//        '<a href="mailto:' + str1 + '">' + str1 + '</a>';
//      strEle = parseAnchor( str1 + ' ' + str1 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 mark.park@tosslab.com mark.park@tosslab.com
//      str1 = '가나다';
//      str2 = 'mark.park@tosslab.com';
//      temp =
//        str1 + ' ' +
//        '<a href="mailto:' + str2 + '">' + str2 + '</a> ' +
//        '<a href="mailto:' + str2 + '">' + str2 + '</a>';
//      strEle = parseAnchor( str1 + ' ' + str2 + ' ' + str2 );
//      expect( strEle ).toEqual( temp );
//
//      // mark.park@tosslab.com mark.park@tosslab.com 라마바
//      str1 = 'mark.park@tosslab.com';
//      str2 = '라마바';
//      temp =
//        '<a href="mailto:' + str1 + '">' + str1 + '</a> ' +
//        '<a href="mailto:' + str1 + '">' + str1 + '</a> ' +
//        str2;
//      strEle = parseAnchor( str1 + ' ' + str1 + ' ' + str2 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 mark.park@tosslab.com mark.park@tosslab.com 라마바
//      str1 = '가나다';
//      str2 = 'mark.park@tosslab.com';
//      str3 = '라마바';
//      temp =
//        str1 + ' ' +
//        '<a href="mailto:' + str2 + '">' + str2 + '</a> ' +
//        '<a href="mailto:' + str2 + '">' + str2 + '</a> ' +
//        str3;
//      strEle = parseAnchor( str1 + ' ' + str2 + ' ' + str2 + ' ' + str3 );
//      expect( strEle ).toEqual( temp );
//
//      // mark.park@tosslab
//      str1 = 'mark.park@tosslab';
//      temp = str1;
//      strEle = parseAnchor( str1 );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 mark.park@tosslab
//      str1 = '가나다';
//      str2 = 'mark.park@tosslab';
//      temp = str1 + ' ' + str2;
//      strEle = parseAnchor( temp );
//      expect( strEle ).toEqual( temp );
//
//      // mark.park@tosslab 라마바
//      str1 = 'mark.park@tosslab';
//      str2 = '라마바';
//      temp = str1 + ' ' + str2;
//      strEle = parseAnchor( temp );
//      expect( strEle ).toEqual( temp );
//
//      // 가나다 mark.park@tosslab
//      str1 = '가나다';
//      str2 = 'mark.park@tosslab';
//      str3 = '라마바';
//      temp = str1 + ' ' + str2 + ' ' + str3;
//      strEle = parseAnchor( temp );
//      expect( strEle ).toEqual( temp );
//    });
//  }
//})();