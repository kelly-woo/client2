'use strict'

var nativeForEach =Array.prototype.forEach;
var nativeIsArray = Array.isArray;
 
var breaker = {};

 var HTTP_PROTOCOL = (("https:" == document.location.protocol) ? "https://" : "http://"),
	LIB_VERSION = '2.3.0',
	//SNIPPET_VERSION = (mixpanel && mixpanel['__SV']) || 0,
	// http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
	// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
	USE_XHR = (window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());
	// IE<10 does not support cross-origin XHR's but script tags
	// with defer won't block window.onload; ENQUEUE_REQUESTS
	// should only be true for Opera<12
	//ENQUEUE_REQUESTS = !USE_XHR && (userAgent.indexOf('MSIE') == -1) && (userAgent.indexOf('Mozilla') == -1);



var each = function(obj, iterator, context) {
 	if (obj == null) return;
 	if (nativeForEach && obj.forEach === nativeForEach) { //NatvieForEach= Array.prototype.Foreach
 		obj.forEach(iterator, context);
 	} else if (obj.length === +obj.length) {// For array below ECMA5 and JS 1.6 (= below IE8)
 		for (var i = 0, l = obj.length; i < l; i++) {
 			if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
 		}
 	} else {
 		for (var key in obj) {
 			if (hasOwnProperty.call(obj, key)) {
 				if (iterator.call(context, obj[key], key, obj) === breaker) return;
 			}
 		}
 	}
 };

 var isUndefined = function(obj) {
	return obj === void 0;
};

var isArray = nativeIsArray || function(obj) {
	return toString.call(obj) === '[object Array]';
};

var isObject = function(obj) {
	return (obj === Object(obj) && !isArray(obj));
};

var isDate = function(obj) {
	return toString.call(obj) == '[object Date]';
};

var formatDate = function(d) {
	// YYYY-MM-DDTHH:MM:SS in UTC
	function pad(n) {return n < 10 ? '0' + n : n}
	return d.getUTCFullYear() + '-'
	+ pad(d.getUTCMonth() + 1) + '-'
	+ pad(d.getUTCDate()) + 'T'
	+ pad(d.getUTCHours()) + ':'
	+ pad(d.getUTCMinutes()) + ':'
	+ pad(d.getUTCSeconds());
};

var encodeDates = function(obj) {
 	each(obj, function(v, k) {
 		if (isDate(v)) {
 			obj[k] =formatDate(v);
 		} else if (isObject(v)) {
		obj[k] = encodeDates(v); // recurse
		}
	});
 	return obj;
 };

var truncate = function(obj, length) {
	var ret;
	if (typeof(obj) === "string") {
		ret = obj.slice(0, length);
	} else if (isArray(obj)) {
		ret = [];
		each(obj, function(val) {
		ret.push(truncate(val, length));
	});
	} else if (isObject(obj)) {
		ret = {};
		each(obj, function(val, key) {
		ret[key] = truncate(val, length);
		});
	} else {
		ret = obj;
	}
	return ret;
};

var base64Encode = function(data) {
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];
	if (!data) {
		return data;
	}
	data =  utf8Encode(data);
	do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);
		bits = o1<<16 | o2<<8 | o3;
		h1 = bits>>18 & 0x3f;
		h2 = bits>>12 & 0x3f;
		h3 = bits>>6 & 0x3f;
		h4 = bits & 0x3f;
		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);
	enc = tmp_arr.join('');
	switch( data.length % 3 ){
		case 1:
			enc = enc.slice(0, -2) + '==';
			break;
		case 2:
			enc = enc.slice(0, -1) + '=';
			break;
	}
	return enc;
};

var utf8Encode = function(string) {
	string = (string+'').replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	var utftext = "",
	start,
	end;
	var stringl = 0,
	n;
	start = end = 0;
	stringl = string.length;
	for (n = 0; n < stringl; n++) {
		var c1 = string.charCodeAt(n);
		var enc = null;
		if (c1 < 128) {
			end++;
		} else if((c1 > 127) && (c1 < 2048)) {
			enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
		} else {
			enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.substring(start, end);
			}
			utftext += enc;
			start = end = n+1;
		}
	}
	if (end > start) {
		utftext += string.substring(start, string.length);
	}
	return utftext;
};







var JSONEncode = (function() {
 	return function(mixed_val) {
 		var indent;
 		var value = mixed_val;
 		var i;
 		var quote = function (string) {
 			var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var meta = { // table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"' : '\\"',
				'\\': '\\\\'
			};
			escapable.lastIndex = 0;
			return escapable.test(string) ?
			'"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string' ? c :
			'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' :
			'"' + string + '"';
		};
		var str = function(key, holder) {
			var gap = '';
			var indent = ' ';
			var i = 0; // The loop counter.
			var k = ''; // The member key.
			var v = ''; // The member value.
			var length = 0;
			var mind = gap;
			var partial = [];
			var value = holder[key];
			// If the value has a toJSON method, call it to obtain a replacement value.
			if (value && typeof value === 'object' &&
				typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}
			// What happens next depends on the value's type.
			switch (typeof value) {
				case 'string':
					return quote(value);
				case 'number':
					// JSON numbers must be finite. Encode non-finite numbers as null.
					return isFinite(value) ? String(value) : 'null';
				case 'boolean':
				case 'null':
					// If the value is a boolean or null, convert it to a string. Note:
					// typeof null does not produce 'null'. The case is included here in
					// the remote chance that this gets fixed someday.
						return String(value);
				case 'object':
					// If the type is 'object', we might be dealing with an object or an array or
					// null.
					// Due to a specification blunder in ECMAScript, typeof null is 'object',
					// so watch out for that case.
					if (!value) {
						return 'null';
					}
					// Make an array to hold the partial results of stringifying this object value.
					gap += indent;
					partial = [];
					// Is the value an array?
					if (toString.apply(value) === '[object Array]') {
						// The value is an array. Stringify every element. Use null as a placeholder
						// for non-JSON values.
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null';
						}
						// Join all of the elements together, separated with commas, and wrap them in
						// brackets.
						v = partial.length === 0 ? '[]' :
						gap ? '[\n' + gap +
						partial.join(',\n' + gap) + '\n' +
						mind + ']' :
						'[' + partial.join(',') + ']';
						gap = mind;
						return v;
					}
					// Iterate through all of the keys in the object.
					for (k in value) {
						if (hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
					// Join all of the member texts together, separated with commas,
					// and wrap them in braces.
					v = partial.length === 0 ? '{}' :
					gap ? '{' + partial.join(',') + '' +
					mind + '}' : '{' + partial.join(',') + '}';
					gap = mind;
					return v;
			}
		};
		// Make a fake root object containing our value under the key of ''.
		// Return the result of stringifying the value.
		return str('', {
			'': value
		});
	};
})();

var send_request = function(data) {

 	data['$token'] = mixpanel.get_config('token');
 	data['$distinct_id'] = mixpanel.get_distinct_id();

 	var date_encoded_data = encodeDates(data)
 	, truncated_data = truncate(date_encoded_data, 255)
 	, json_data = JSONEncode(date_encoded_data)
 	, encoded_data = base64Encode(json_data);

 	send_query(
 		mixpanel.get_config('api_host') + '/engage/',
 		{ 'data': encoded_data }
 		);
 	return truncated_data;
 };

var HTTPBuildQuery = function(formdata, arg_separator) {
	var key, use_val, use_key, tmp_arr = [];
	if (typeof(arg_separator) === "undefined") {
		arg_separator = '&';
	}
	each(formdata, function(val, key) {
		use_val = encodeURIComponent(val.toString());
		use_key = encodeURIComponent(key);
		tmp_arr[tmp_arr.length] = use_key + '=' + use_val;
	});
	return tmp_arr.join(arg_separator);
};

var send_query = function(url, data) {
	// if (ENQUEUE_REQUESTS) {
	// 	this.__request_queue.push(arguments);
	// 	return;
	// }
	// needed to correctly format responses
	var verbose_mode = mixpanel.get_config('verbose');
	if (data['verbose']) { verbose_mode = true; }
	if (mixpanel.get_config('test')) { data['test'] = 1; }
	if (verbose_mode) { data['verbose'] = 1; }
	if (mixpanel.get_config('img')) { data['img'] = 1; }

	data['ip'] = 0;

	data['_'] = new Date().getTime().toString();

	url += '?' + HTTPBuildQuery(data);

	if ('img' in data) {
		var img = document.createElement("img");
		img.src = url;
		document.body.appendChild(img);
	} else if (USE_XHR) {
	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	// send the mp_optout cookie
	// withCredentials cannot be modified until after calling .open on Android and Mobile Safari
	req.withCredentials = true;

	req.send(null);
	} else {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.async = true;
	script.defer = true;
	script.src = url;
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(script, s);
	}
};


var custom_mixpanel_people_set = function(prop, to) {
	var data = {};
	var $set = {};
	if (isObject(prop)) {
		each(prop, function(v, k) {
			// We will get these ourselves
			if (k == '$distinct_id' || k == '$token') {
				return;
			} else {
				$set[k] = v;
			}
		});
	} else {
		$set[prop] = to;
	}
	data["$set"] = $set;
	return send_request(data);
};