var APP = require("core");
var UTIL = require("utilities");

var CONFIG = arguments[0] || {};

$.Wrapper.id = CONFIG.id || 0;
$.heading.text = CONFIG.heading || "";
$.subHeading.color = APP.Settings.colors.primary || "#000";
$.subHeading.text = CONFIG.subHeading || "";

if($.subHeading.text === "") {
	$.subHeading.height = '7dp';
}

if(CONFIG.hideBorder) {
	$.borderBottom.hide();
}

if(CONFIG.showTime) {
	var bgcolor = (CONFIG.startTimeObj.getHours() >= 12) ? "#323439" : "#696a6d";

	var circle = Ti.UI.createView({
		width: "40dp",
		height: "40dp",
		borderRadius: "20dp",
		borderColor: bgcolor,
		backgroundColor: bgcolor,
		top: "10dp",
		left: "10dp"
	});
	$.timeWrapper.add(circle);

	var time = Ti.UI.createLabel({
		top: "10dp",
		left: "10dp",
		width: "40dp",
		height: "40dp",
		color: '#eeeeee',
		font: {
			fontSize: 11
		},
		text: (CONFIG.currentSession) ? 'now' : UTIL.getAMPMTime(CONFIG.startTimeObj, "hh:mm"),
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	$.timeWrapper.add(time);

}

if(CONFIG.last) {
	var borderBottom = Ti.UI.createView({
		width: Ti.UI.FIT,
		height: "1",
		bottom: 0,
		left: 0,
		backgroundColor: "#c1c1c1"
	});
	$.Wrapper.add(borderBottom);
}

$.Wrapper.touchStart = function() {
	$.contentWrapper.backgroundGradient = {
		type: "linear",
		colors: [
			"#ddd",
			"#ddd"
		],
		startPoint: {
			x: 0,
			y: 0
		},
		endPoint: {
			x: 0,
			y: "100%"
		},
		backFillStart: true
	};
};

$.Wrapper.touchEnd = function() {
	$.contentWrapper.backgroundGradient = {
		type: "linear",
		colors: [
			"#F8F8F8",
			"#ECECEC"
		],
		startPoint: {
			x: 0,
			y: 0
		},
		endPoint: {
			x: 0,
			y: "100%"
		},
		backFillStart: true
	};
};

// I don't like this, it really needs to be cleaned up.
var onLayoutComplete = function() {
	var height = $.contentWrapper.getSize().height;
	if(height === 0) {
		return;
	}

	if(height < 60) {
		$.contentWrapper.setHeight(60);
	}

	var borderLeft = Ti.UI.createView({
		width: "1",
		height: $.contentWrapper.getSize().height,
		top: 0,
		bottom: 0,
		backgroundColor: "#DDD",
		left: 0
	});
	$.contentWrapper.add(borderLeft);

	$.contentWrapper.removeEventListener("postlayout", onLayoutComplete);
};
$.contentWrapper.addEventListener("postlayout", onLayoutComplete);