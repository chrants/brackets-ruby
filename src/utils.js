String.prototype.replaceAll = function(a, b) {
    var toReturn = this;
    var temp;
    do {
        temp = toReturn;
    } while(
        (toReturn = toReturn.replace(a, b)) !== temp
    );
    return toReturn;
};


// Helper function that chains a series of promise-returning
// functions together via their done callbacks.
function chain() {
    var functions = Array.prototype.slice.call(arguments, 0);
    if (functions.length > 0) {
        var first = functions.shift(),
            firstFunction = first.shift(),
            params,
            firstPromise;
        if(first.length > 0) {
            params = first[0];
            console.log("about to enter:" + firstFunction);
            console.log("with params: ");
            console.log(params);
            firstPromise = firstFunction.call(self || this, params);
        } else {
            firstPromise = firstFunction.call();
        }
        firstPromise.done(function () {
            chain.apply(null, functions);
        });
    }
}

var stringify = function(obj) {
    var string = "{\n";
    if(obj === undefined) {
        return 'undefined';
    } else if(obj instanceof String || 
              obj instanceof Number ||
              obj instanceof Boolean ||
              obj instanceof RegExp || 
              obj instanceof Function) {
        return obj.toString();
    } else {
        for(var key in obj) {
            string += "\t'" + key + '\'' + ': ' + stringify(obj[key]) + ",\n";   
        }
        string += '}';
        return string;
    }
};
   