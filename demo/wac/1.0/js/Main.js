// ----------------- Main ----------------- \\
var Demo = {};


(Demo.Main = function ($){

	return {

		initialize: function(){
			try {
				$.Persistence.detect();
                $.Routes.setUrl(document.documentURI.replace(/index\.html$/, ""));
				$.Routes.navigate("index.html");
			}
			catch (e) {
				alert (e.message);
			}
		}
	};

}(Demo));
