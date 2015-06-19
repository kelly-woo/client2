

$(window).resize(function() {
	var jqViewerBody = $('.viewer-body')
	$('.content').children().css({
		maxWidth: jqViewerBody.width() - 56 * 2,
		maxHeight: jqViewerBody.height() -56 * 2
	});
});
