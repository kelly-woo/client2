/**
 * @fileoverview extract mention spec
 */
(function() {
  'use strict';

  xdescribe('mention.ahead.service', function() {
    var MentionExtractor;


    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_MentionExtractor_) {
      MentionExtractor = _MentionExtractor_;
    }));

    describe('mention 입력 판별자 확인', function() {
      it('"@"가 mention 입력인지 확인한다.', function() {
        var fullText = '@';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@',
          sufStr: '',
          match: ['@', '@', ''],
          offset: 0,
          length: 1
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('"@mark"가 mention 입력인지 확인한다.', function() {
        var fullText = '@mark';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@mark',
          sufStr: '',
          match: ['@mark', '@mark', 'mark'],
          offset: 0,
          length: 5
        };

        expect(mention).toEqual(mentionExpect);
      });


      it('"@850912"가 mention 입력인지 확인한다.', function() {
        var fullText = '@850912';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@850912',
          sufStr: '',
          match: ['@850912', '@850912', '850912'],
          offset: 0,
          length: 7
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('"@`!@#$%^&*()_+~-=[];\',.{}|:"<>?"가 mention 입력인지 확인한다.', function() {
        var fullText = '@`!@#$%^&*()_+~-=[];\',.{}|:"<>?';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@`!@#$%^&*()_+~-=[];\',.{}|:"<>?',
          sufStr: '',
          match: ['@`!@#$%^&*()_+~-=[];\',.{}|:"<>?', '@`!@#$%^&*()_+~-=[];\',.{}|:"<>?', '`!@#$%^&*()_+~-=[];\',.{}|:"<>?'],
          offset: 0,
          length: 31
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('"@mark @park"가 "@park" mention 입력인지 확인한다.', function() {
        var fullText = '@mark @park';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@mark @park',
          sufStr: '',
          match: [' @park', '@park', 'park'],
          offset: 6,
          length: 5
        };

        expect(mention).toEqual(mentionExpect);
      });


      it('"@mark park"가 mention 입력인지 확인한다.', function() {
        var fullText = '@mark park';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@mark park',
          sufStr: '',
          match: ['@mark park', '@mark park', 'mark park'],
          offset: 0,
          length: 10
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('"@박현진"가 mention 입력인지 확인한다.', function() {
        var fullText = '@박현진';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@박현진',
          sufStr: '',
          match: ['@박현진', '@박현진', '박현진'],
          offset: 0,
          length: 4
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('"@박 현진"가 mention 입력인지 확인한다.', function() {
        var fullText = '@박 현진';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@박 현진',
          sufStr: '',
          match: ['@박 현진', '@박 현진', '박 현진'],
          offset: 0,
          length: 5
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('"@mark(박 현진)"가 mention 입력인지 확인한다.', function() {
        var fullText = '@mark(박 현진)';
        var begin = fullText.length;
        var mention;
        var mentionExpect;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);
        mentionExpect = {
          preStr: '@mark(박 현진)',
          sufStr: '',
          match: ['@mark(박 현진)', '@mark(박 현진)', 'mark(박 현진)'],
          offset: 0,
          length: 11
        };

        expect(mention).toEqual(mentionExpect);
      });

      it('30자 넘는 문자열이 mention 입력인지 확인한다.', function() {
        var fullText = '@0123456789012345678901234567890';
        var begin = fullText.length;
        var mention;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);

        expect(mention).toEqual(undefined);
      });


      it('"qwe@"가 mention 입력인지 확인한다.', function() {
        var fullText = 'qwe@';
        var begin = fullText.length;
        var mention;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);

        expect(mention).toEqual(undefined);
      });

      it('"qwe qwe@"가 mention 입력인지 확인한다.', function() {
        var fullText = 'qwe qwe@';
        var begin = fullText.length;
        var mention;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);

        expect(mention).toEqual(undefined);
      });

      it('"qwe [@"가 mention 입력인지 확인한다.', function() {
        var fullText = 'qwe qwe@';
        var begin = fullText.length;
        var mention;

        mention = MentionExtractor.getMentionOnCursor({}, fullText, begin);

        expect(mention).toEqual(undefined);
      });
    });

    describe('markdown text에서 모든 mention 입력 검출 확인', function() {
      var mentionsMap = {
        '[@all]': {},
        '[@park]': {id: 1},
        '[@hyun]': {id: 2},
        '[@jin]': {id: 3}
      };

      it('"[@park]"의 mentions 입력을 확인한다.', function() {
        var fullText = '[@park]';
        var mentions;
        var mentionsExpect;

        mentions = MentionExtractor.getMentionAllForText(fullText, mentionsMap, 1);
        mentionsExpect = {
          msg: '@park',
          mentions: [
            {offset : 0, length: 5, id: 1, type: 'member' }
          ]
        };

        expect(mentions).toEqual(mentionsExpect)
      });

      it('"[@all]"의 mentions 입력을 확인한다.', function() {
        var fullText = '[@all]';
        var entityId = 1234567890;
        var mentions;
        var mentionsExpect;

        mentions = MentionExtractor.getMentionAllForText(fullText, mentionsMap, entityId);
        mentionsExpect = {
          msg: '@all',
          mentions: [
            {offset : 0, length: 4, id: entityId, type: 'room' }
          ]
        };

        expect(mentions).toEqual(mentionsExpect)
      });

      it('"qweqwe [@park] qweqwe"의 mentions 입력을 확인한다.', function() {
        var fullText = 'qweqwe [@park] qweqwe';
        var mentions;
        var mentionsExpect;

        mentions = MentionExtractor.getMentionAllForText(fullText, mentionsMap);
        mentionsExpect = {
          msg:  'qweqwe @park qweqwe',
          mentions: [
            {offset: 7, length: 5, id: 1, type: 'member'}
          ]
        };

        expect(mentions).toEqual(mentionsExpect);
      });

      it('"[@park] [@mark]"의 mentions 입력을 확인한다.', function() {
        var fullText = '[@park]';
        var mentions;
        var mentionsExpect;

        mentions = MentionExtractor.getMentionAllForText(fullText, mentionsMap);
        mentionsExpect = {
          msg: '@park',
          mentions: [{offset: 0, length: 5, id: 1, type: 'member'}]
        };

        expect(mentions).toEqual(mentionsExpect);
      });

      it('"qweqwe [@park] \r\n[@hyun] qweqwe [@jin] qweqwe"의 mentions 입력을 확인한다.', function() {
        var fullText = 'qweqwe [@park] \r\n[@hyun] qweqwe [@jin] qweqwe';
        var mentions;
        var mentionsExpect;

        mentions = MentionExtractor.getMentionAllForText(fullText, mentionsMap);
        mentionsExpect = {
          msg: 'qweqwe @park \r\n@hyun qweqwe @jin qweqwe',
          mentions: [
            {offset: 7, length: 5, id: 1, type: 'member'},
            {offset: 15, length: 5, id: 2, type: 'member'},
            {offset: 28, length: 4, id: 3, type: 'member'}
          ]
        };

        expect(mentions).toEqual(mentionsExpect);
      });

      it('"[@kram]"의 mentions 입력을 확인한다.', function () {
        var fullText = '[@kram]';
        var mentions;

        mentions = MentionExtractor.getMentionAllForText(fullText, mentionsMap);

        expect(mentions).toEqual(undefined);
      });
    });
  });
})();
