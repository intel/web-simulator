/*
 * Class: Console
 * Purpose: Perform various functions with the browser javasript console
 */
(Demo.Console = function ($) {


	var _buffer = "",
		_options = {
			"append": "append"
		};

	return {

		isAvailable: function(){
			return window && window.console ? true : false;
		},

		/*
		 * Public Method: returns all available logging options (only supports append at this time)
		 * Purpose:
		 */
		getOptions: function (){
			return $.Copy(_options);
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		bufferLog: function(msg, options, method){

			if(!console){ $.Exception.raise($.Exception.types.ConsoleNotFound, "console was not found or is falsy."); }
			if(!console[method]){ $.Exception.raise($.Exception.types.ConsoleMethodNotFound, "console method "+method+" was not found or is falsy."); }

			options = options || {};

			_buffer += msg;

			if (options !== _options.append){
				console[method](_buffer);
				_buffer = "";
			}

		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		log: function (msg, options) {
			$.Utils.validateNumberOfArguments(0, 2, arguments.length);
			this.bufferLog(msg, options, "log");
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		logObj: function (obj) {
			$.Utils.validateNumberOfArguments(1, 1, arguments.length);
			console.log(obj);
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		warn: function(msg, options){
			$.Utils.validateNumberOfArguments(0, 2, arguments.length);
			this.bufferLog(msg, options, "warn");
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		error: function(msg, options){
			$.Utils.validateNumberOfArguments(0, 2, arguments.length);
			this.bufferLog(msg, options, "error");
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		clear: function(){
			console.clear();
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		transactionBegin: function(title){
			console.group(title);
		},

		/*
		 * Public Method:
		 * Purpose:
		 */
		transactionEnd: function(){
			console.groupEnd();
		}

	};

}(Demo));