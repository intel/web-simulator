(Demo.Exception = function ($){

	return {

		types: {
			ArgumentLength: "ArgumentLength",
			ArgumentType: "ArgumentType",
			Argument: "Argument",
			DomObjectNotFound: "DomObjectNotFound",
			MethodNotImplemented: "MethodNotImplemented",
			InvalidState: "InvalidState",
			TestSuite: "TestSuiteException",
			ConsoleNotFound: "ConsoleNotFound",
			ConsoleMethodNotFound: "ConsoleMethodNotFound",
			UnknownPersistence: "UnknownPersistence"
		},

		handle: function(exception, reThrow){
			$.Utils.validateNumberOfArguments(1, 2, arguments.length);

			reThrow = reThrow || false;

			// TODO: find out why jsUnity stops running if line below is deleted
			$.Utils.validateMultipleArgumentTypes(arguments, ['object', 'boolean']);

			var eMsg = exception.message || "exception caught!",
				msg = eMsg+"\n\n"+(exception.stack || "*no stack provided*")+"\n\n";


			// TODO: make this more robust (i.e. catch errors that could mangle logging an error to non-existence console or markup), also log Exception name
			if($.Console.isAvailable()){
				$.Console.error(msg);
			}

			if (reThrow){
				throw exception;
			}
		},

		raise: function(exceptionType, message, customExceptionObject){
			$.Utils.validateNumberOfArguments(1, 3, arguments.length);

			var obj = customExceptionObject || {};
			message = message || "";

			$.Utils.validateMultipleArgumentTypes([exceptionType, message, obj], ['string', 'string', 'object']);

			obj.name = exceptionType;
			obj.type = exceptionType;
			obj.message = message;

			if($.Console.isAvailable()){ $.Console.error(obj); }

			throw obj;
		}


	};

}(Demo));