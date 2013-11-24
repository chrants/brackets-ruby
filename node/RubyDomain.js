(function() {
    
    var util            = require('util'),
        child_process   = require('child_process'),
        exec            = child_process.exec,
        spawn           = child_process.spawn;
    
    var execRuby = function(params) {
        var ruby = spawn('ruby', (params));
        _setRubySpawnCallbacks(ruby);
    }
    var _setRubySpawnCallbacks = function(ruby) {
        ruby.stdout.on('data', function(data) {
            console.log('RUBY EXEC: ' + data);
        });
        ruby.stderr.on('data', function(data) {
            console.error('RUBY EXEC ERR: ' + data);
        });
        ruby.on('exit', function (code) {
          console.log('RUBY child process exited with code ' + code);
        });
    }
    
    var execIrb = function(params) {
        var irb = spawn('irb', (params));
        _setIrbSpawnCallbacks(irb);
    }
    var _setIrbSpawnCallbacks = function(irb) {
        irb.stdout.on('data', function(data) {
            console.log('IRB EXEC: ' + data);
        });
        irb.stderr.on('data', function(data) {
            console.error('IRB EXEC ERR: ' + data);
        });
        irb.on('exit', function (code) {
          console.log('IRB child process exited with code ' + code);
        });
    }
    
    function init(DomainManager) {
        if (!DomainManager.hasDomain("ruby")) {
            DomainManager.registerDomain("ruby", {major: 0, minor: 1});
        }
        DomainManager.registerCommand(
            "ruby",       // domain name
            "exec",    // command name
            execRuby,   // command handler function
            false,          // this command is synchronous
            "Runs the ruby program specified in its params.",
            [],             // no parameters
            //[{name: "memory",
            //    type: "{total: number, free: number}",
            //    description: "amount of total and free memory in bytes"}]
        );
    }
    
    exports.init = init;
        
})();