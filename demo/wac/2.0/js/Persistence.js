// Dependencies:

// jQuery 1.4.2 (http://jquery.com)
// json2 (http://www.json.org/json2.js)
// utils.js

// tinyHippos is the global object used to encapsulate all of our helper libraries.
// Feel free to change this object to whatever best suits your project

(Demo.Persistence = function($, JQuery){

	var _persistenceTypes = {
			"Widget_1_0": "Widget_1_0",
			"Widget_1_2_1": "Widget_1_2_1",
			"widget": "widget",
			"localstorage": "localstorage",
			"cookie": "cookie"
		},
		_currentPersistence;

	function _sanitizeReturnedValue(value){
		if(value === null || value === undefined || value == ''){
			return null;
		}
		else {
			return value;
		}
	}


	function _save(key, value, prefix){

		prefix = _validateAndSetPrefix(prefix);

		switch(_currentPersistence){

			case _persistenceTypes.localstorage:
				localStorage[prefix+key] = value;
				break;

			case _persistenceTypes.Widget_1_0:
				Widget.setPreferenceForKey(prefix+key, value);
				break;

			case _persistenceTypes.Widget_1_2_1:
				Widget.setPreferenceForKey(value, prefix+key);
				break;

			case _persistenceTypes.widget:
				widget.setPreferenceForKey(value, prefix+key);
				break;
			case _persistenceTypes.cookie:
				// Using jQuery for simplicity, feel free to use your own cookie management system
				// doing that will remove your dependency on jQuery
				JQuery.cookie(prefix+key, value);
				break;

			default:
				// Throwing a generic exception here. Please modify this to better fit with
				// whatever exception management you are using
				throw {
					type: "UnknownPersistence",
					message: "Could not detect an appropriate persistence mechanism."
				}
		}
	}

	function _retrieve(key, prefix){

		var result;

		prefix = _validateAndSetPrefix(prefix);

		switch(_currentPersistence){

			case _persistenceTypes.localstorage:
				result = localStorage[prefix + key];
				break;

			case _persistenceTypes.Widget_1_0:
			case _persistenceTypes.Widget_1_2_1:
				result = Widget.preferenceForKey(prefix + key);
				break;

			case _persistenceTypes.widget:
				result = widget.preferenceForKey(prefix + key);
				break;

			case _persistenceTypes.cookie:
				// Using jQuery for simplicity, feel free to use your own cookie management system
				// doing that will remove your dependency on jQuery
				result = JQuery.cookie(prefix+key);
				break;

			default:
				// Throwing a generic exception here. Please modify this to better fit with
				// whatever exception management you are using
				throw {
					type: "UnknownPersistence",
					message: "Could not detect an appropriate persistence mechanism when attempting to invoke storage call."
				}
		}

		return _sanitizeReturnedValue(result);
	}

	function _remove(key, prefix){

		prefix = _validateAndSetPrefix(prefix);

		switch(_currentPersistence){

			case _persistenceTypes.Widget_1_0:
				Widget.setPreferenceForKey(prefix + key, null);
				break;

			case _persistenceTypes.Widget_1_2_1:
				Widget.setPreferenceForKey(null, prefix + key);
				break;

			case _persistenceTypes.widget:
				widget.setPreferenceForKey(null, prefix + key);
				break;

			case _persistenceTypes.localstorage:
				localStorage.removeItem(prefix + key);
				break;

			case _persistenceTypes.cookie:
				// Using jQuery for simplicity, feel free to use your own cookie management system
				// doing that will remove your dependency on jQuery
				JQuery.cookie(prefix+key, null);
				break;

			default:
				throw {
					// Throwing a generic exception here. Please modify this to better fit with
					// whatever exception management you are using
					type: "UnknownPersistence",
					message: "Could not detect an appropriate persistence mechanism when attempting to invoke storage call."
				}
		}
	}

	function _validateAndSetPrefix(prefix) {
		if (prefix) {
			$.Utils.validateArgumentType(prefix, "string");
		}

		return prefix || "";
	}

	// Public properties/methods
	return {
		// attempt to detect persistence
		// You'll need to call this method before you can perform any persistence actions!
		detect: function(){
			if(window && window.Widget){
				Widget.setPreferenceForKey("tinyHippos_key", "tinyHippos_value");

				if(Widget.preferenceForKey("tinyHippos_key") == "tinyHippos_value"){
					_currentPersistence = _persistenceTypes.Widget_1_0;
					Widget.setPreferenceForKey("tinyHippos_key", null);
				}
				else if (Widget.preferenceForKey("tinyHippos_value") == "tinyHippos_key") {
					_currentPersistence = _persistenceTypes.Widget_1_2_1;
					Widget.setPreferenceForKey(null, "tinyHippos_value");
				}
				else {
					// Throwing a generic exception here. Please modify this to better fit with
					// whatever exception management you are using
					throw {
						type: "UnknownPersistence",
						message: "Could not detect an appropriate persistence mechanism for Widget."
					}
				}
			}
			else if(window && window.widget){
				_currentPersistence = _persistenceTypes.widget;
			}
			else if(window && window.localStorage){
				_currentPersistence = _persistenceTypes.localstorage;
			}
			else if (JQuery.cookie) {
				_currentPersistence = _persistenceTypes.cookie;
			}
			else{
				// Throwing a generic exception here. Please modify this to better fit with
				// whatever exception management you are using
				throw {
					type: "UnknownPersistence",
					message: "Could not detect an appropriate persistence mechanism."
				}
			}
		},

		// Helper method to retrieve the current persistence type being used
		currentPersistence: function(){
			return $.Copy(_persistenceTypes[_currentPersistence]);
		},

		// Helper method to allow you to manually override the persistence type used
		set: function(persistenceType){
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(1, 1, arguments.length);
			//			$.Utils.validateArgumentType(persistenceType, "string", null, "Persistence.set");

			_currentPersistence = persistenceType;
		},

		save: function (key, value, prefix){
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(2, 3, arguments.length);
			//			$.Utils.validateArgumentType(key, "string", null, "Persistence.save");
			//			if (value) {
			//				$.Utils.validateArgumentType(value, "string");
			//			}

			_save(key, value, prefix);
		},

		// This function is used to save a JSON object, you must have JSON available for this to work.
		saveObject: function (key, obj, prefix){
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(2, 3, arguments.length);
			//			$.Utils.validateArgumentType(key, "string", null, "Persistence.saveObject");
			//			if (obj) {
			//				$.Utils.validateArgumentType(obj, "object");
			//			}

			_save(key, JSON.stringify(obj), prefix);
		},

		retrieve: function (key, prefix){
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(1, 2, arguments.length);
			//			$.Utils.validateArgumentType(key, "string", null, "Persistence.retrieve");

			return _retrieve(key, prefix);
		},

		retrieveObject: function (key, prefix){
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(1, 2, arguments.length);
			//			$.Utils.validateArgumentType(key, "string");

			var retrievedValue = _retrieve(key, prefix);
			return retrievedValue ? JSON.parse(retrievedValue) : retrievedValue;
		},

		remove: function (key, prefix){
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(1, 2, arguments.length);
			//			$.Utils.validateArgumentType(key, "string", null, "Persistence.remove");

			_remove(key, prefix);
		},

		removeAllLocalStorage: function (prefix) {
			//			uncomment this block if you would like to validate the arguments being passed in
			//			$.Utils.validateNumberOfArguments(0, 1, arguments.length);

			prefix = _validateAndSetPrefix(prefix);

			// loop over keys and regex out the ones that have our prefix and delete them
			for (var key in localStorage) {
				if (key.match("^"+prefix)) {
					localStorage.removeItem(key);
				}
			}
		}

	};
}(Demo, $));