(function() {
    
    var util            = require('util'),
        child_process   = require('child_process'),
        exec            = child_process.exec,
        spawn           = child_process.spawn;
    
    var rubyProcess, irbProcess;
    
    require('../src/utils');
    
    var platform = process.platform,
        isWindows = platform === 'win32';
    
    var execRuby = function(params) {
        var cmd = isWindows ? 'ruby.exe' : 'ruby';
        var ruby = rubyProcess = spawn(cmd, (params));
        _setRubySpawnCallbacks(ruby);
    }
    var _setRubySpawnCallbacks = function(ruby) {
        ruby.stdout.on('data', function(data) {
            data.eachLine(function(line) {
                console.log('RUBY EXEC: ' + line);
                $("#rb-run-results-output").append('<li>' + line + '</li>');
            });
        });
        ruby.stderr.on('data', function(data) {
            console.error('RUBY EXEC ERR: ' + data);
        });
        ruby.on('error', function() {
            console.log(arguments);
        });
        ruby.on('exit', function (code) {
            console.log('RUBY child process exited with code ' + code);
        });
    }
    
    var execIrb = function(params) {
        var cmd = isWindows ? 'irb.exe' : 'irb';
        var irb = irbProcess = spawn('cmd', (params));
        _setIrbSpawnCallbacks(irb);
    }
    var _setIrbSpawnCallbacks = function(irb) {
        irb.stdout.on('data', function(data) {
            data.eachLine(function(line) {
                console.log('IRB EXEC: ' + line);
                $("#rb-run-results-output").append('<li>' + line + '</li>');
            });
        });
        irb.stderr.on('data', function(data) {
            console.error('IRB EXEC ERR: ' + data);
        });
        irb.on('error', function() {
            console.log(arguments);
        });
        irb.on('exit', function (code) {
            console.log('IRB child process exited with code ' + code);
        });
    }
    
    var killRuby = function() {
        if(rubyProcess)
            rubyProcess.kill();
    };
    
    var killIrb = function() {
        if(irbProcess)
            irbProcess.kill();
    };
    
    function init(DomainManager) {
        _registerDomain(DomainManager);
        _registerCommands(DomainManager);
    }
    
    var _registerDomain = function(DomainManager) {
        if (!DomainManager.hasDomain("ruby")) {
            DomainManager.registerDomain("ruby", {major: 0, minor: 2});
        }
    };
    
    var _registerCommands = function(DomainManager) {
        DomainManager.registerCommand(
            "ruby",       // domain name
            "exec",    // command name
            execRuby,   // command handler function
            false,          // this command is synchronous
            "Runs the ruby program specified in its params.",
            []             // no parameters
            //[{name: "memory",
            //    type: "{total: number, free: number}",
            //    description: "amount of total and free memory in bytes"}]
        );
        DomainManager.registerCommand(
            "ruby",       // domain name
            "irb",    // command name
            execIrb,   // command handler function
            false,          // this command is synchronous
            "Runs irb with options specified.",
            []             // no parameters
        );
        DomainManager.registerCommand(
            "ruby",       // domain name
            "killRuby",    // command name
            killRuby,   // command handler function
            false,          // this command is synchronous
            "Attempts to kill the ruby process.",
            []             // no parameters
        );
        DomainManager.registerCommand(
            "ruby",       // domain name
            "killIrb",    // command name
            killIrb,   // command handler function
            false,          // this command is synchronous
            "Attempts to kill the irb process.",
            []             // no parameters
        );
    };
    
    exports.init = init;
        
})();