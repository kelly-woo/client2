/**
 * @fileoverview extract mention spec
 */
(function() {
  'use strict';

  describe('mention.ahead.service', function() {
    var MentionExtractor;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_MentionExtractor_) {
      MentionExtractor = _MentionExtractor_;
    }));

    it('text가 mention 입력인지 판별한다.', function() {
      var fullText = 'qweqweqwe @mark';
      var begin = fulltext.length - 1;
      var mention;

      mention = MentionExtractor.getMentionOnCursor(fullText, begin);

      console.log(expect(mention).to.be);
    });
  });
})();
