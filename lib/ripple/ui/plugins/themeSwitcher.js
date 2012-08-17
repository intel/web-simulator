/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var utils = require('ripple/utils'),
    db = require('ripple/db'),
    THEME_KEY = "ui-theme",
    THEME_SELECTOR = "#theme-select",
    _currentTheme;

function _saveAndReload(key, value) {
    jWorkflow.order(function (prev, baton) {
                baton.take();
                db.save(key, value, null, baton.pass);
            }).start(function () {
                window.tinyHipposReload = true;
                location.reload();
            });
}

module.exports = {
    initialize: function () {
        var themeToSet = db.retrieve(THEME_KEY);

	// Hide the theme switcher and always set the theme to light
        jQuery(".theme-switcher").hide();
		if (themeToSet !== "light") {
            _saveAndReload(THEME_KEY, "light");
		}
		return;
    }
};
