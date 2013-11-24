(function() {
    
    var util            = require('util'),
        child_process   = require('child_process'),
        exec            = child_process.exec,
        spawn           = child_process.spawn;
    
    var execRuby = function(params) {
        var ruby = spawn('ruby', (params));
        _setRubySpawnCallbacks();
    }
    var _setRubySpawnCallbacks = function() {}
    
    var execIrb = function(params) {
        var irb = spawn('irb', (params));
        _setIrbSpawnCallbacks();
    }
    var _setIrbSpawnCallbacks = function() {}
    
    var init = function() {}
    
    exports.init = init;
        
})();