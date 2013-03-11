var APP = require("core");
var SOCIAL = require("social");
var UTIL = require("utilities");
var MODEL = require("models/schedule")();

var CONFIG = arguments[0] || {};
var ACTION = {};

$.init = function() {
	APP.log("debug", "schedule_details.init | " + JSON.stringify(CONFIG));

	MODEL.init(CONFIG.index);

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	$.handleData(MODEL.getSession(CONFIG.id));
};

$.handleData = function(_data) {
	APP.log("debug", "schedule_details.handleData");

	$.handleNavigation();

	$.heading.text = _data.title;
	$.text.value = _data.description;
	$.date.text = UTIL.getMonth(_data.startTimeObj.getMonth()) + ' ' + _data.startTimeObj.getDate() + ', ' + _data.startTimeObj.getFullYear() + ' @ ' + UTIL.getAMPMTime(_data.startTimeObj, "hh:mm ampm");
	$.date.color = APP.Settings.colors.primary;

	$.speaker.text = _data.speaker;
	if(_data.speaker === "" || _data.speaker === "undefined") {
		$.header.remove($.speaker);
	}
	$.location.text = _data.room + ' - ' + _data.location;

	if(_data.image !== "undefined") {
		var width = APP.Device.width - 60;

		var image = Ti.UI.createImageView({
			image: _data.image,
			width: width + "dp",
			height: Ti.UI.SIZE,
			preventDefaultImage: true
		});

		$.image.add(image);
	} else {
		$.content.remove($.image);
	}

	ACTION.url = _data.link;

	if(APP.Device.isHandheld) {
		$.NavigationBar.showBack({
			callback: function(_event) {
				APP.removeAllChildren();
			}
		});
	}

	// ToDo: Add in actions.
	// $.NavigationBar.showAction({
	//	callback: function(_event) {
	//		SOCIAL.share(ACTION.url, $.NavigationBar.right);
	//	}
	// });
};

$.handleNavigation = function() {
	ACTION.next = MODEL.getNextSession(CONFIG.id);
	ACTION.previous = MODEL.getPreviousSession(CONFIG.id);

	var navigation = Alloy.createWidget("com.chariti.detailNavigation", null, {
		down: function(_event) {
			APP.log("debug", "schedule_details @next");

			APP.addChild("schedule_details", {
				id: ACTION.next.id,
				index: CONFIG.index
			});
		},
		up: function(_event) {
			APP.log("debug", "schedule_details @previous");

			APP.addChild("schedule_details", {
				id: ACTION.previous.id,
				index: CONFIG.index
			});
		}
	}).getView();

	$.NavigationBar.addNavigation(navigation);
};

// Kick off the init
$.init();