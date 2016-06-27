//
// Attaching navigation sidebar
//
//
$(document).ready(function () {
	"use strict";
	
	// Config
	var domEltFix = $(".sidebar-nav"),
		domFixTo = $(".scrollspy-search"),
		cssFix = "fixed",
		isFixed = false;

	$(window).scroll(function () {
		if ($(this).scrollTop() > domFixTo.offset().top) {
			if (!isFixed) {
				var w = domEltFix.width();
				domEltFix.addClass(cssFix);
				isFixed = true;
				domEltFix.css('width', w + "px");
			}
		} else {
			if (isFixed) {
				domEltFix.removeClass(cssFix);
				isFixed = false;
				domEltFix.css('width', 'auto');
			}
		}
	});
});

//
// Scroll Spy
//
// Based on http://jsfiddle.net/mekwall/up4nu/

$(document).ready(function () {
	"use strict";
	
	// Variables/Config
	var domSearch = ".scrollspy-search",
		domHeader = ".page-title",
		tagHeader = "h1",
		domDisplay = ".scrollspy-display",
		cssCurrent = "scrollspy-current";

	// Assemble list of elements:
	var lastElement = null,
		menuEntries = $(domHeader).add(domSearch).find(tagHeader).map(function (i, elt) {
			// Create an li, keep track of the original element
			// Wrap the contents inside a span, give it the same text as the original, return the raw DOM node.
			return $("<li>").prop("origHeader", elt)
				.append($("<a>").text($(elt).text())).get();
		});
  

	$(domDisplay).append($("<ol>").append(menuEntries));
	
	// Bind click handler to menu items
	// so we can get a fancy scroll animation
	menuEntries.click(function (e) {
		var offsetTop = $($(this).prop("origHeader")).offset().top;
		$('html, body').stop().animate({
			scrollTop: offsetTop
		}, 300);
		e.preventDefault();
	});

	// Bind to scroll
	$(window).scroll(function () {
		// Get container scroll position
		var fromTop = $(this).scrollTop(),
			cur = menuEntries.map(function () {
				if ($($(this).prop("origHeader")).offset().top <= fromTop + 1) {
					return this;
				}
			});
		
		// If no item is selected but one used to be:
		if (cur.length === 0) {
			if (lastElement) {
				$(lastElement).removeClass(cssCurrent);
				lastElement = null;
			}
		} else {
			// Get the id of the current element
			cur = cur[cur.length - 1];
			// If the current and previous items are different:
			if (lastElement !== cur) {
				$(lastElement).removeClass(cssCurrent);
				$(cur).addClass(cssCurrent);
				lastElement = cur;
			}
		}
	});

	// Set the area to be visible
	$(domDisplay).css({display: "block"});
});