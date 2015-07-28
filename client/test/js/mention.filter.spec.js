(function() {
  'use strict';

  //@JiHoon 291
  //@Young Park 11153801
  //@mak pak 3017772

  describe('mention.filter', function() {
    var $filter;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it('mention 을 적절한 html 스트링으로 잘 변환되는지 확인한다.', function() {
      var mentionFilter = $filter('mention');
      var message1 = {
        content: '@Young Park Check this out, @Hugo, @JiHoon,@mak pak!important!',
        mentions: [
          {
            id: 3017772,
            type: 'member',
            offset: 43,
            length: 8
          },
          {
            id: 291,
            type: 'member',
            offset: 35,
            length: 7
          },
          {
            id: 11153801,
            type: 'member',
            offset: 0,
            length: 11
          }
        ],
        expect: '<a mention-view="11153801" mention-type="member">@Young Park</a> Check this out, @Hugo, <a mention-view="291" mention-type="member">@JiHoon</a>,<a mention-view="3017772" mention-type="member">@mak pak</a>!important!'
      };
      var message2 = {
        content: '@Young Park Check this out, @Hugo, @JiHoon,@mak pak!important!',
        expect: '@Young Park Check this out, @Hugo, @JiHoon,@mak pak!important!'
      };

      expect(mentionFilter(message1.content, message1.mentions)).toEqual(message1.expect);
      expect(mentionFilter(message2.content, message2.mentions)).toEqual(message2.expect);
    });
  });
})();
