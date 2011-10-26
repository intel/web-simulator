// ----------------- Main ----------------- \\
(Demo.UI = function ($, JQuery){

	function _setNav(el, text, view, params){
        if (!el) {
            return;
        }
        
		if (text){
			el.innerHTML = text;

			el.setAttribute("onmousedown", "Demo.Routes.navigate(" + (view ? "'" + view + "'" : "") + (params ? ", ['" + params.join(",") +"']" : "") + ")");
		}
		else {
            el.innerHTML = "";
            el.setAttribute("onmousedown", "");
		}
	}

	return {

		loadView: function(str){
			JQuery($.Constants.common.view).html(str);
			return this;
		},

		setLeftNav: function(text, view, params, callback){
			_setNav(document.getElementById($.Constants.common.navLeft), text, view, params);
			return this;
		},

		setRightNav: function(text, view, params, navType, callback){
			_setNav(document.getElementById($.Constants.common.navRight), text, view, params);
			return this;
		},

		setTitle: function (text){
			JQuery($.Constants.common.headerTitle).html((text === "" || !text) ? "&nbsp;" : text);
			return this;
		},

		hideHeader: function () {
			JQuery($.Constants.common.header).addClass($.Constants.css.irrelevant);
			return this;
		},

		showHeader: function () {
			JQuery($.Constants.common.header).removeClass($.Constants.css.irrelevant);
			this.setTitle();
			return this;
		}

	};

}(Demo, $));