var APP = require("core");
var UTIL = require("utilities");
var MODEL = require("models/schedule")();

var CONFIG = arguments[0];
var SELECTED;

var offset = 0;
var refreshLoading = false;
var refreshEngaged = false;

$.init = function() {
	APP.log("debug", "schedule.init | " + JSON.stringify(CONFIG));

	MODEL.init(CONFIG.index);

	APP.openLoading();

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	if(CONFIG.isChild === true) {
		$.NavigationBar.showBack();
	}

	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu();
	} else {
		$.NavigationBar.showSettings();
	}
};

$.retrieveData = function(_force, _callback) {
	MODEL.fetch({
		url: CONFIG.data,
		cache: _force ? 0 : CONFIG.cache,
		callback: function() {
			$.handleData(MODEL.getAllSessions());

			if(typeof _callback !== "undefined") {
				_callback();
			}
		}
	});
};

$.handleData = function(_data) {
	APP.log("debug", "schedule.handleData");

	var sections = [];
	var section = null;
	var prevDate = null;
	var prevHour = null;
	var showTime = false;
	var currentSession = false;

	for(var i = 0, x = _data.length; i < x; i++) {
		var date = _data[i].startTimeObj.getDate();
		if(prevDate !== date) {
			section = Ti.UI.createTableViewSection({
				headerView: Alloy.createController("schedule_section", {
					heading: UTIL.getMonth(_data[i].startTimeObj.getMonth()) + ' ' + date + ', ' + _data[i].startTimeObj.getFullYear()
				}).getView()
			});
			prevDate = date;
			prevHour = null;
		}

		var hour = _data[i].startTimeObj.getHours();
		if(prevHour !== hour) {
			showTime = true;
			prevHour = hour;
		}

		var row = Alloy.createController("schedule_row", {
			id: _data[i].id,
			heading: _data[i].title,
			subHeading: _data[i].speaker,
			startTimeObj: _data[i].startTimeObj,
			currentSession: _data[i].currentSession,
			showTime: showTime,
			hideBorder: (_data[i + 1] === undefined || date !== _data[i + 1].startTimeObj.getDate()),
			last: (i === _data.length - 1)
		}).getView();
		showTime = false;

		section.add(row);

		if(_data[i + 1] === undefined || date !== _data[i + 1].startTimeObj.getDate()) {
			sections.push(section);
			section = null;
		}
	}

	$.container.setData(sections);

	APP.closeLoading();
};

// Event listeners
$.Wrapper.addEventListener("APP:screenAdded", function(_event) {
	$.retrieveData();
});

$.container.addEventListener("touchstart", function(_event) {

	APP.log("debug", "article @touchstart " + _event.row.id);

	_event.row.touchStart();

	if(APP.Device.isTablet) {
		if(_event.row.id == SELECTED) {
			return;
		} else {
			SELECTED = _event.row.id;
		}
	}

	APP.addChild("schedule_details", {
		id: _event.row.id,
		index: CONFIG.index
	});
});

$.container.addEventListener("touchend", function(_event) {
	_event.row.touchEnd();
});

// Kick off the init
$.init();