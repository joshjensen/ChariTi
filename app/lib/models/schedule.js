var APP = require("core");
var HTTP = require("http");
var UTIL = require("utilities");

function Model() {
	var TID;

	this.init = function(_id) {
		APP.log("debug", "SCHEDULE.init(" + _id + ")");

		TID = _id;

		var db = Ti.Database.open("ChariTi");

		db.execute("CREATE TABLE IF NOT EXISTS schedule_" + TID + " (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, room TEXT, location TEXT, speaker TEXT, description TEXT, image TEXT, startTime TEXT, endTime TEXT);");

		db.close();
	};

	this.fetch = function(_params) {
		APP.log("debug", "SCHEDULE.fetch");
		APP.log("trace", JSON.stringify(_params));

		var isStale = UTIL.isStale(_params.url, _params.cache);

		if(isStale) {
			if(_params.cache !== 0 && isStale !== "new") {
				_params.callback();
			}

			HTTP.request({
				timeout: 10000,
				type: "GET",
				format: "TEXT",
				url: _params.url,
				passthrough: _params.callback,
				success: this.handleData,
				failure: function(_error) {
					alert("Unable to connect. Please try again later.");
				}
			});
		} else {
			_params.callback();
		}
	};

	this.handleData = function(_data, _url, _passthrough) {
		APP.log("debug", "SCHEDULE.handleData");

		var data = JSON.parse(_data);
		var sessions = data.sessions;

		if(sessions.length > 0) {
			var db = Ti.Database.open("ChariTi");

			db.execute("DELETE FROM schedule_" + TID + ";");
			db.execute("BEGIN TRANSACTION;");

			for(var i = 0, x = sessions.length; i < x; i++) {
				var title = UTIL.cleanEscapeString(sessions[i].title);
				var room = UTIL.cleanEscapeString(sessions[i].room);
				var location = UTIL.cleanEscapeString(sessions[i].location);
				var speaker = UTIL.cleanEscapeString(sessions[i].speaker);
				var description = UTIL.cleanEscapeString(sessions[i].description);
				var image = UTIL.cleanEscapeString(sessions[i].image);
				var startTime = new Date(sessions[i].startTime).getTime();
				var endTime = new Date(sessions[i].endTime).getTime();

				db.execute("INSERT INTO schedule_" + TID + " (id, title, room, location, speaker, description, image, startTime, endTime) VALUES (NULL, " + title + ", " + room + ", " + location + ", " + speaker + ", " + description + ", " + image + ", " + startTime + ", " + endTime + ");");
			}

			db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
			db.execute("END TRANSACTION;");
			db.close();
		}

		if(_passthrough) {
			_passthrough();
		}
	};

	this.getAllSessions = function() {
		APP.log("debug", "SCHEDULE.getAllSessions");

		var db = Ti.Database.open("ChariTi");
		var data = db.execute("SELECT id, title, speaker, startTime, endTime FROM schedule_" + TID + " ORDER BY startTime ASC;");
		var temp = [];

		var currentTime = new Date().getTime();

		while(data.isValidRow()) {

			var startTime = data.fieldByName("startTime");
			var startTimeObj = new Date(parseInt(startTime, 10));
			var endTime = data.fieldByName("endTime");

			var currentSession = false;
			if(currentTime > startTime && currentTime < endTime) {
				currentSession = true;
			}

			temp.push({
				id: data.fieldByName("id"),
				title: data.fieldByName("title"),
				speaker: data.fieldByName("speaker"),
				startTime: startTime,
				startTimeObj: startTimeObj,
				currentSession: currentSession
			});

			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

	this.getSession = function(_id) {
		APP.log("debug", "SCHEDULE.getSession");

		var db = Ti.Database.open("ChariTi");
		var data = db.execute("SELECT * FROM schedule_" + TID + " WHERE id = " + UTIL.cleanEscapeString(_id) + ";");
		var temp;

		var currentTime = new Date().getTime();

		while(data.isValidRow()) {
			var startTime = data.fieldByName("startTime");
			var startTimeObj = new Date(parseInt(startTime, 10));
			var endTime = data.fieldByName("endTime");

			var currentSession = false;
			if(currentTime > startTime && currentTime < endTime) {
				currentSession = true;
			}

			temp = {
				id: data.fieldByName("id"),
				title: data.fieldByName("title"),
				room: data.fieldByName("room"),
				location: data.fieldByName("location"),
				speaker: data.fieldByName("speaker"),
				description: data.fieldByName("description"),
				startTime: startTime,
				startTimeObj: startTimeObj,
				endTime: endTime,
				currentSession: currentSession,
				image: null
			};

			if(data.fieldByName("image")) {
				temp.image = data.fieldByName("image");
			}

			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

	this.getNextSession = function(_id) {
		APP.log("debug", "SCHEDULE.getNextSession");

		var db = Ti.Database.open("ChariTi");
		var data = db.execute("SELECT id FROM schedule_" + TID + " WHERE id > " + UTIL.cleanEscapeString(_id) + " ORDER BY id ASC LIMIT 1;");
		var temp;

		if(data.rowCount === 0) {
			data = db.execute("SELECT id FROM schedule_" + TID + " ORDER BY id ASC LIMIT 1;");
		}

		while(data.isValidRow()) {
			temp = {
				id: data.fieldByName("id")
			};

			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

	this.getPreviousSession = function(_id) {
		APP.log("debug", "SCHEDULE.getPreviousSession");

		var db = Ti.Database.open("ChariTi");
		var data = db.execute("SELECT id FROM schedule_" + TID + " WHERE id < " + UTIL.cleanEscapeString(_id) + " ORDER BY id DESC LIMIT 1;");

		if(data.rowCount === 0) {
			data = db.execute("SELECT id FROM schedule_" + TID + " ORDER BY id DESC LIMIT 1;");
		}

		var temp;

		while(data.isValidRow()) {
			temp = {
				id: data.fieldByName("id")
			};

			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

}

module.exports = function() {
	return new Model();
};