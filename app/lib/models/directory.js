var APP = require("core");
var HTTP = require("http");
var UTIL = require("utilities");

function Model() {
	var TID;

	this.init = function(_id) {
		APP.log("debug", "DIRECTORY.init(" + _id + ")");

		TID = _id;

		var db = Ti.Database.open("ChariTi");

		db.execute("CREATE TABLE IF NOT EXISTS directory_" + TID + " (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT, firstName TEXT, lastName TEXT, email TEXT, company TEXT, image TEXT, question1 TEXT, question2 TEXT);");

		db.close();
	};

	this.fetch = function(_params) {
		APP.log("debug", "DIRECTORY.fetch");
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
		APP.log("debug", "DIRECTORY.handleData");

		try {

			var data = JSON.parse(_data);
			var profiles = data.profiles;

			if(profiles.length > 0) {
				var db = Ti.Database.open("ChariTi");

				db.execute("DELETE FROM directory_" + TID + ";");
				db.execute("BEGIN TRANSACTION;");

				for(var i = 0, x = profiles.length; i < x; i++) {

					var uid = UTIL.cleanEscapeString(profiles[i].uid);
					var firstName = UTIL.cleanEscapeString(profiles[i].firstName);
					var lastName = UTIL.cleanEscapeString(profiles[i].lastName);
					var email = UTIL.cleanEscapeString(profiles[i].email);
					var company = UTIL.cleanEscapeString(profiles[i].company);
					var image = UTIL.cleanEscapeString(profiles[i].image);
					var question1 = UTIL.cleanEscapeString(profiles[i].question1);
					var question2 = UTIL.cleanEscapeString(profiles[i].question2);

					db.execute("INSERT INTO directory_" + TID + " (id, uid, firstName, lastName, email, company, image, question1, question2) VALUES (NULL, " + uid + ", " + firstName + ", " + lastName + ", " + email + ", " + company + ", " + image + ", " + question1 + ", " + question2 + ");");
				}

				db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
				db.execute("END TRANSACTION;");
				db.close();
			}

			if(_passthrough) {
				_passthrough();
			}

		} catch(e) {
			console.log(JSON.stringify(e));
		}
	};

	this.getAllProfiles = function() {
		APP.log("debug", "DIRECTORY.getAllProfiles");

		var db = Ti.Database.open("ChariTi");
		var data = db.execute("SELECT id, firstName, lastName, company FROM directory_" + TID + " ORDER BY firstName ASC;");
		var temp = [];

		while(data.isValidRow()) {

			temp.push({
				id: data.fieldByName("id"),
				firstName: data.fieldByName("firstName"),
				lastName: data.fieldByName("lastName"),
				company: data.fieldByName("company")
			});

			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

	this.getProfile = function(_id) {
		APP.log("debug", "DIRECTORY.getProfile");

		var db = Ti.Database.open("ChariTi");
		var data = db.execute("SELECT * FROM directory_" + TID + " WHERE id = " + UTIL.cleanEscapeString(_id) + ";");
		var temp;

		var currentTime = new Date().getTime();

		while(data.isValidRow()) {

			temp = {
				id: data.fieldByName("id"),
				uid: data.fieldByName("uid"),
				firstName: data.fieldByName("firstName"),
				lastName: data.fieldByName("lastName"),
				email: data.fieldByName("email"),
				company: data.fieldByName("company"),
				image: null,
				question1: data.fieldByName("question1"),
				question2: data.fieldByName("question2")
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

}

module.exports = function() {
	return new Model();
};