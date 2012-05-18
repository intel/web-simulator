ver | find "Version 6" && set DIR=%LOCALAPPDATA%|| set DIR=%APPDATA%
set CHROME=%DIR%\Google\Chrome\Application\chrome.exe
set /p OPTIONS= <%CD%\sdk-wrt-options.txt
start %CHROME% %OPTIONS% --app="file://%CD%/web/index.html" --user-data-dir=%CD%/sdk-profile-data/
