// clone code courtesy of: http://my.opera.com/GreyWyvern/blog/show.dml/1725165
// but modified and tightened by Dan Silivestru, Brent Lintner
(Demo.Copy = function($){
    return (function(obj) {

        var i,
            newObj = (obj instanceof Array) ? [] : {};
        if( typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean'){
            return obj;
        }

        if(obj instanceof Date){
            newObj = new Date(obj);
            return newObj;
        }

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i] && typeof obj[i] === "object") {
                    if (obj[i] instanceof Date) {
                        newObj[i] = obj[i];
                    }
                    else {
                        newObj[i] = $.Copy(obj[i]);
                    }
                } else { newObj[i] = obj[i]; }
            }
        }


        return newObj;
    });
}(Demo));