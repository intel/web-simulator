CUR=$(cd $(dirname $0) && pwd)
CHROME=google-chrome
if [ "$OS" == "darwin" ] || [ "$(uname)" == "Darwin" ]; then
    CHROME_PATH=/Applications
    CHROME="$CHROME_PATH/Google Chrome.app/Contents/MacOS/Google Chrome"
    if ! test -e "$CHROME"; then
        CHROME_PATH=~/Desktop
        CHROME="$CHROME_PATH/Google Chrome.app/Contents/MacOS/Google Chrome"
    fi
fi

"$CHROME" $(cat $CUR/sdk-wrt-options.txt) --app=file://$CUR/web/index.html --user-data-dir=./sdk-profile-data/
