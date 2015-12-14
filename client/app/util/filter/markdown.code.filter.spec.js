(function() {
  'use strict';

  //@JiHoon 291
  //@Young Park 11153801
  //@mak pak 3017772

  describe('markdown.code.filter', function() {
    var $filter;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_('markdown');

    }));
    describe('italic', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('*텍스트* 입니다.');
        var expectString1 = '<i>텍스트</i> 입니다.';

        var markdownString2 = $filter('* 텍스트 * 입니다.');;
        var expectString2 = '<i> 텍스트 </i> 입니다.';

        var markdownString3 = $filter('중간 *텍스트* 입니다.');
        var expectString3 = '중간 <i>텍스트</i> 입니다.';

        var markdownString4 = $filter('중간 * 텍스트 * 입니다.');
        var expectString4 = '중간 <i> 텍스트 </i> 입니다.';

        var markdownString5 = $filter('중간 *텍스트*');
        var expectString5 = '중간 <i>텍스트</i>';

        var markdownString6 = $filter('중간 * 텍스트 *');
        var expectString6 = '중간 <i> 텍스트 </i>';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
      });
    });

    describe('bold', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('**텍스트** 입니다.');
        var expectString1 = '<b>텍스트</b> 입니다.';

        var markdownString2 = $filter('** 텍스트 ** 입니다.');;
        var expectString2 = '<b> 텍스트 </b> 입니다.';

        var markdownString3 = $filter('중간 **텍스트** 입니다.');
        var expectString3 = '중간 <b>텍스트</b> 입니다.';

        var markdownString4 = $filter('중간 ** 텍스트 ** 입니다.');
        var expectString4 = '중간 <b> 텍스트 </b> 입니다.';

        var markdownString5 = $filter('중간 **텍스트**');
        var expectString5 = '중간 <b>텍스트</b>';

        var markdownString6 = $filter('중간 ** 텍스트 **');
        var expectString6 = '중간 <b> 텍스트 </b>';

        var markdownString7 = $filter('중간 ~* 텍스트 *~');
        var expectString7 = '중간 ~* 텍스트 *~';
        
        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
      });
    });


    describe('bold-italic', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('***텍스트*** 입니다.');
        var expectString1 = '<i><b>텍스트</b></i> 입니다.';

        var markdownString2 = $filter('*** 텍스트 *** 입니다.');;
        var expectString2 = '<i><b> 텍스트 </b></i> 입니다.';

        var markdownString3 = $filter('중간 ***텍스트*** 입니다.');
        var expectString3 = '중간 <i><b>텍스트</b></i> 입니다.';

        var markdownString4 = $filter('중간 *** 텍스트 *** 입니다.');
        var expectString4 = '중간 <i><b> 텍스트 </b></i> 입니다.';

        var markdownString5 = $filter('중간 ***텍스트***');
        var expectString5 = '중간 <i><b>텍스트</b></i>';

        var markdownString6 = $filter('중간 *** 텍스트 ***');
        var expectString6 = '중간 <i><b> 텍스트 </b></i>';

        var markdownString7 = $filter('중간 *~* 텍스트 *~*');
        var expectString7 = '중간 *~* 텍스트 *~*';
        
        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
      });
    });

    describe('strike-through', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('~~텍스트~~ 입니다.');
        var expectString1 = '<del>텍스트</del> 입니다.';

        expect(markdownString1).toEqual(expectString1);
      });
    });


    describe('혼합 테스트', function() {
      describe('계층 구조의 텍스트도 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 취소선~~을 해본다**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 취소선</del>을 해본다</b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
        it('띄어쓰기 없는 복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반*기울임**굵게기울임~~그리고취소선~~을해본다**텍스트의끝*');
          var expectString1 = '일반<i>기울임<b>굵게기울임<del>그리고취소선</del>을해본다</b>텍스트의끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
      });
      describe('Anchor 가 포함된 텍스트도 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>~~을 해본다**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 <a href="http://www.jandi.com/test">취소선</a></del>을 해본다</b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
        it('복잡한 마크다운 2', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 취소선~~을 <a href="http://www.jandi.com/test">해본다</a>**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 취소선</del>을 <a href="http://www.jandi.com/test">해본다</a></b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
        it('띄어쓰기 없는 복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반*기울임**굵게기울임~~그리고<a href="http://www.jandi.com/test">취소선</a>~~을해본다**텍스트의끝*');
          var expectString1 = '일반<i>기울임<b>굵게기울임<del>그리고<a href="http://www.jandi.com/test">취소선</a></del>을해본다</b>텍스트의끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
      });
    });
  });
})();
