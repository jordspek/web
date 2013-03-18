// jQuery
$(document).ready(function() {
	// Twitter Footer
	$(".tweet").tweet({
		username: "zencoderinc",
		join_text: "auto",
		avatar_size: 32,
		count: 1,
		auto_join_text_default: "we said,", 
		auto_join_text_ed: "we",
		auto_join_text_ing: "we were",
		auto_join_text_reply: "we replied to",
		auto_join_text_url: "we were checking out",
		loading_text: "loading tweets..."
	});

	$('#sub_nav_container').waypoint(function(event, direction) {
		$('#sub_nav.stuck').toggleClass('hidden', direction === "up");
	});
	var scrollElement = 'html, body';
	$("a[href^='#'][class='scroll']").click(function(event) {
		event.preventDefault();
		var $this = $(this),
		target = this.hash,
		$target = $(target);
		$(scrollElement).stop().animate({
				'scrollTop': $target.offset().top
			}, 500, 'swing', function() {
			window.location.hash = target;
		});
	});

	// How it works infographic
	$('#request_infographic').mouseover(function() {
		$('#request_01').fadeIn('fast');
	}).mouseout(function() {
		$('#request_01').fadeOut('fast');
	 });
	$('#section_overlay_1').mouseover(function() {
		$('#request_infographic').addClass('hover');
		$('#request_01').fadeIn('fast');
	 }).mouseout(function() {
		$('#request_infographic').removeClass('hover');
		$('#request_01').fadeOut('fast');
	 });
	$('#section_overlay_2').mouseover(function() {
		$('#transcode_infographic').addClass('hover');
		$('#request_02').fadeIn('fast');
	}).mouseout(function() {
		$('#transcode_infographic').removeClass('hover');
		$('#request_02').fadeOut('fast');
	 });
	$('#section_overlay_3').mouseover(function() {
		$('#notify_infographic').addClass('hover');
		$('#request_03').fadeIn('fast');
	}).mouseout(function() {
		$('#notify_infographic').removeClass('hover');
		$('#request_03').fadeOut('fast');
	});
	$('#transcode_infographic').mouseover(function() {
		$('#request_02').fadeIn('fast');
	 }).mouseout(function() {
		$('#request_02').fadeOut('fast');
	 });
	$('#notify_infographic').mouseover(function() {
		$('#request_03').fadeIn('fast');
	}).mouseout(function() {
		$('#request_03').fadeOut('fast');
	});

	/*****************/
	/** BEGIN Forms **/
	/*****************/
	// Submit the contact sales form
	$('form#contact-sales-form').submit(function() {
		// Format the Data object
		var post = {
			"source"								: "contact-sales",
			"firstname"								: $('#firstname').val(),
			"lastname"								: $('#lastname').val(),
			"email"									: $('#email').val(),
			"comments"								: $('#comments').val(),
			"profile_product_interest_encoding"		: true,
			"spam"									: false
		};
		waitForm();
		resetForm(post);
		postToWebService(post, 'form#contact-sales-form', 'div#contact-sales-thanks');
		return false;
	});

	// Submit the contact support form
	$('form#contact-support-form').submit(function() {
		// Format the Data object
		var post = {
			"source"								: "contact-support",
			"firstname"								: $('#firstname').val(),
			"lastname"								: $('#lastname').val(),
			"email"									: $('#email').val(),
			"subject"								: $('#subject').val(),
			"message"								: $('#message').val(),
			"spam"									: false
		};
		waitForm();
		resetForm(post);
		postToWebService(post, 'form#contact-support-form', 'div#contact-support-thanks');
		return false;
	});

	// Helper function to reset the form
	function resetForm(post) {
		for(prop in post) {
			var sel = '#' + prop;
			$(sel).parent('fieldset').removeClass('error');
		}
	}

	// Helper function to put the form in wait mode
	function waitForm() {
		$('button#submit').attr('disabled', 'disabled');
		$('img#spinner').show();
	}

	// Helper function to take the form out of wait mode
	function unwaitForm() {
		$('button#submit').removeAttr('disabled');
		$('img#spinner').hide();
	}

	// Helper function for submitting forms
	function postToWebService(post, formSel, thanksSel) {
		$.ajax({
			type: 'POST',
			url: '/en/web-service',
			data: post,
			timeout: 30000,
			dataType: 'json',
			success: function(data) {
				if(data.submit==true) {
					$(formSel).hide();
					$(thanksSel).fadeIn();
				} else {
					for(var i=0; i<data.errors.length; i++) {
						var sel = '#' + data.errors[i];
						$(sel).parent('fieldset').addClass('error');
					}
				}
				unwaitForm();
			},
			error: function() {
				alert('Unable to contact server. Please try again later.');
				unwaitForm();
			}
		});
	}
	/***************/
	/** END Forms **/
	/***************/
});

// Shadowbox for How it works gallery
Shadowbox.init({skipSetup: true});
window.onload = function() {
	// open a welcome message as soon as the window loads
	Shadowbox.setup('a.shadowbox', {
		gallery: 'APIfeatures'
	});
};

// Homepage Feature Rotation
var FeatureRotator = {
	delay: 7000, // Change back to 7000
	fadeTime: ($.browser.msie) ? 50 : 400, // IE does weird things with alpha shadow fading, so speed up fading
	current: 0,
	timer: null,
	featureCount: null,

	// Chrome has an issue where if you schedule timeouts in a tab that's not showing, 
	// it will try to catch up all the timeouts when you come back to the page.
	// This was causing it to pile up a bunch of 'next' calls and start triggering swaps to new features all at once.
	// Now setting/checking if it's currently swapping so it knows not to do a second at the same time.
	swapping: false,

	init: function() {
		if ($.browser.msie && $.browser.version < 7) return;
		FeatureRotator.featureCount = $(".main_feature").length;
		// Next button behavior
		$(".slide-next").click(function() {
			FeatureRotator.stop();
			FeatureRotator.next(true);
			return false;
		});
		// Previous button behavior
		$(".slide-prev").click(function() {
			FeatureRotator.stop();
			FeatureRotator.previous(true);
			return false;
		});
		// Setup a handler for when the has changes (BBQ)
		$(window).bind('hashchange', function(e) {
			var hash = location.hash;
			FeatureRotator.advanceToHash(hash);
		});
		// Click a tab
		$("#main_feature_list li").click(function() {
			var hash = $(this).children('a').attr('href');
			$.bbq.pushState(hash);
			FeatureRotator.stop();
			FeatureRotator.jump($("#main_feature_list li").index(this));
			return false;
		});
		// Handle any current hash, or activate the first item and start scolling
		if(location.hash!='' && $("a[href='"+location.hash+"']").length>0) {
			FeatureRotator.stop();
			FeatureRotator.advanceToHash(location.hash);
		} else {
			$("#main_feature_list li:first-child").addClass('active');
			$("#main_feature_pieces div.main_feature:first-child").css('display', 'block');
			FeatureRotator.start();
		}
	},

	start: function() {
		FeatureRotator.nextWithTimeout();
	},

	stop: function() {
		clearTimeout(FeatureRotator.timer);
	},

	nextWithTimeout: function() {
		FeatureRotator.timer = setTimeout(function() {
			if (FeatureRotator.swapping == false) {
				FeatureRotator.next();
			}
			FeatureRotator.nextWithTimeout();
		}, FeatureRotator.delay);
	},

	next: function(fast) {
		var current = FeatureRotator.current;
		if (current >= (FeatureRotator.featureCount - 1)) {
			var next = 0;
		} else {
			var next = current + 1;
		}
		FeatureRotator.swap(current, next, fast);
	},

	previous: function(fast) {
		var current = FeatureRotator.current;
		if (current <= 0) {
			var prev = (FeatureRotator.featureCount - 1);
		} else {
			var prev = current - 1;
		}
		FeatureRotator.swap(current, prev, fast);
	},

	jump: function(to) {
		FeatureRotator.swap(FeatureRotator.current, to, true);
	},

	swap: function(from, to, fast) {
		FeatureRotator.swapping = true;
		$( $(".main_feature")[from] ).hide();
		$("#main_feature_list li").removeClass("active");
		$( $(".main_feature")[to] ).fadeIn(100, function() {
			$($("#main_feature_list li")[to]).addClass("active");
			FeatureRotator.swapping = false;
		});
		FeatureRotator.current = to;
	},

	advanceToHash : function(hash) {
		var li = $("a[href='"+location.hash+"']").parent();
		if( li.length > 0 ) {
			var i = $("#main_feature_list li").index(li);
			FeatureRotator.stop();
			FeatureRotator.jump(i);
		}
	}
}

$(function(){
	if ($("#home").length > 0 && $(".main_feature").length > 1) {
		FeatureRotator.init();
	}
});


// FAQ Toggle
$(document).ready(function() {
	$(".toggle_container").hide();
	$("a.trigger").click(function() {
		$(this).toggleClass("active").next().slideToggle("slow");
		return false;
	});
});

// Facebox
$(function(){
	$('a[rel*=facebox]').facebox()
});