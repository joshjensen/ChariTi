var APP = require("core");
var SOCIAL = require("social");
var DATE = require("alloy/moment");
var STRING = require("alloy/string");
var MODEL = require("models/directory")();

var CONFIG = arguments[0] || {};
var ACTION = {};

$.init = function() {
	APP.log("debug", "directory_profile.init | " + JSON.stringify(CONFIG));

	MODEL.init(CONFIG.index);

	$.handleData(MODEL.getProfile(CONFIG.id));
};

$.handleData = function(_data) {
	APP.log("debug", "directory_profile.handleData");

	$.heading.text = STRING.ucfirst(_data.firstName) + ' ' + STRING.ucfirst(_data.lastName),
	$.text.value = _data.description;
	$.subHeading.text = STRING.ucfirst(_data.company);
	$.subHeading.color = APP.Settings.colors.primary;

	if(_data.image) {
		var width;
		if(APP.Device.isTablet) {
			width = "310";
		} else {
			width = APP.Device.width - 20;
		}

		var image = Ti.UI.createImageView({
			image: "/custom/images/" + _data.image + ".png",
			width: width + "dp",
			height: Ti.UI.SIZE,
			preventDefaultImage: true
		});

		$.image.add(image);
	} else {
		$.content.remove($.image);
	}

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	if(APP.Device.isHandheld) {
		$.NavigationBar.showBack({
			callback: function(_event) {
				APP.removeAllChildren();
			}
		});
	}

	$.NavigationBar.showAction({
		callback: function(_event) {
			var email = Ti.UI.createEmailDialog();

			email.subject = "Mayfield Fund Founder/CEO Summit";
			email.toRecipients = [_data.email];

			email.open();

		}
	});
};

// Kick off the init
$.init();