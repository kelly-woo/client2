//믹스패널식 UUID생성코드 

var UUID = (function() {
	var userAgent = navigator.userAgent;
	var T = function() {
		var d = 1*new Date() , i = 0;
		while (d == 1*new Date()) { i++; }
		return d.toString(16) + i.toString(16);
	};
	var R = function() {
		return Math.random().toString(16).replace('.','');
	};
	var UA = function(n) {
		var ua = userAgent, i, ch, buffer = [], ret = 0;
		function xor(result, byte_array) {
			var j, tmp = 0;
			for (j = 0; j < byte_array.length; j++) {
				tmp |= (buffer[j] << j*8);
			}
			return result ^ tmp;
		}
		for (i = 0; i < ua.length; i++) {
			ch = ua.charCodeAt(i);
			buffer.unshift(ch & 0xFF);
			if (buffer.length >= 4) {
				ret = xor(ret, buffer);
				buffer = [];
			}
		}
		if (buffer.length > 0) { ret = xor(ret, buffer); }
		return ret.toString(16);
	};
	return function() {
		var se = (screen.height*screen.width).toString(16);
		return (T()+"-"+R()+"-"+UA()+"-"+se+"-"+T());
	};
})();


//register 시 libarary 다운받는 코드를 아래와 같이 바꿔주세요~~

// (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
// for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
// mixpanel.init("081e1e9730e547f43bdbf59be36a4e31", {'loaded':function() {
// 	mixpanel.cookie.clear();
// 	mixpanel.identify(UUID());
//		}
//     });