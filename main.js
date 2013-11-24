/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
	'use strict';
    
    var self = this;
    
    var COMMAND_ID = "thejava.exec-ruby-build";   // package-style naming to avoid collisions
    
    var EditorManager   = brackets.getModule("editor/EditorManager"),
        FileUtils       = brackets.getModule("file/FileUtils"),
        InMemoryFile    = brackets.getModule("document/InMemoryFile"),
        PerfUtils       = brackets.getModule("utils/PerfUtils"),
        LanguageManager = brackets.getModule("language/LanguageManager"),
        PanelManager    = brackets.getModule("view/PanelManager"),
        DocumentManager = brackets.getModule("document/DocumentManager");

    var CommandManager  = brackets.getModule("command/CommandManager"),
        Menus           = brackets.getModule("command/Menus"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection  = brackets.getModule("utils/NodeConnection");
    
    var Dialogs         = brackets.getModule("widgets/Dialogs"),
        resultsDialogTemplate = require("text!htmlContent/results-modal.html");
    
    require('./src/utils');
    
    var nodeConnection; 
    
    //console.log('abcdaaajdflk'.replaceAll('a', ''));

    // Function to run when the menu item is clicked
    /*function handleHelloWorld() {
        var editor = EditorManager.getFocusedEditor();
        if (editor) {
            var insertionPos = editor.getCursorPos();
            editor.document.replaceRange("Hello, world!", insertionPos);
        }
    }*/
    
    var _handleRubyRun = function() {
        window.setTimeout( function() {
            var editor = EditorManager.getCurrentFullEditor();
            var document = DocumentManager.getCurrentDocument();
            if (editor && document && document.getLanguage() === "ruby") {
                window.alert('Ruby build running!');
                _runRuby();
            } else {
                window.alert('There is no active window!');
                _sideButton.removeClass('running')
                        .addClass('not-running')
                        .removeProp('disabled');
            }
        }, 0);
    };
    
    var _runRuby = function() {
        nodeConnection = new NodeConnection();
        var options = {
            filePath: EditorManager.getCurrentlyViewedPath() /*localPath*/,
            rubyPath: false,
            verbose: false
        };
        // Call all the helper functions in order
        chain(
            [connect], 
            [_loadRubyDomain], 
            [_loadExec, options]
        );
    };
    
    //PanelManager.createBottomPanel("poop-extension.poop", $("<p>Poop da Woop!!!</p>"));
    var _message = 'Welcome to Ruby coolness';
    
    var _sideButton = $('<a href="#"></a>')
        .attr('id', 'rb-run')
        .attr('class', 'not-running')
        .html('Rb')
        .click(function() {
            if($(this).hasClass('running')) {
                
                window.alert('Ruby build cancelled!');
                _sideButton.removeClass('running')
                    .addClass('not-running')
                    .removeProp('disabled');
            } else {
                $(this).removeClass('not-running')
                    .addClass('running')
                    .prop('disabled', true);
                _handleRubyRun();
            }
        });
    
    ExtensionUtils.loadStyleSheet(module, 'styles.css');
    
    $("#main-toolbar .buttons").append(_sideButton);
    
    //$('#status-bar').append('<p>'+_message+'</p>');
    
    // Helper function to connect to node
    function connect() {
        var connectionPromise = nodeConnection.connect(true);
        connectionPromise.fail(function () {
            console.error("[brackets-ruby-node] failed to connect to node");
        });
        return connectionPromise;
    }
    
    // Helper function that loads our domain into the node server
    var _loadRubyDomain = function() {
        var path = ExtensionUtils.getModulePath(module, "node/RubyDomain");
        var loadPromise = nodeConnection.loadDomains([path], true);
        loadPromise.fail(function () {
            console.log("[brackets-ruby-node] failed to load domain");
        });
        return loadPromise;
    };
    
    // Helper function that runs the simple.getMemory command and
    // logs the result to the console
    var _loadExec = function(options) {
        var execParams = [];
        var _ = ' ';
        if(options.filePath) {
            var fp = options.filePath.replaceAll(/[\n\r]/, '');
            execParams.push(fp);
            console.log(fp);
        }
        if(options.rubyPath) {}
        if(options.verbose) {
            execParams.push('-V');
        }
        console.log('About to call ruby.exec with: ' + execParams);
        var execPromise = nodeConnection.domains.ruby.exec(execParams);
        execPromise.fail(function (err) {
            console.error("[brackets-ruby-node] failed to run ruby.exec", err);
        });
        execPromise.done(function (out) {
            console.log(
                out
            );
                
            var data = {
                PROJECT_TITLE: options.filePath.replaceAll(/.*[\/\\]/, '').replaceAll(/\.r[bu]/, ''),
                COMMAND: 'ruby with params ' + execParams.toString(),
                RESULTS: out
            };
            var compiled = Mustache.render(resultsDialogTemplate, data);
            
            Dialogs.showModalDialogUsingTemplate(compiled);
            
            /*$(window).on('rb-build-done', function(output) {
                
            });*/
            
        });
        //window.alert('Ruby build finished!');
        _sideButton.removeClass('running')
                .addClass('not-running')
                .removeProp('disabled');
        return execPromise;
    };
    
    
    
    // First, register a command - a UI-less object associating an id to a handler
    CommandManager.register("Build Ruby File", COMMAND_ID, _handleRubyRun);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
    menu.addMenuItem(COMMAND_ID);

    exports.handleRubyBuild = _handleRubyRun;
    
    
    
    /* 
        Credits to ryuk87 for his base ruby/erb language support 
        Daniele Lenares (Simple Ruby Extension codebase) <daniele.lenares@gmail.com>
    */
    /* ryuk87 START */
    //Ruby Refine
	var ruby_language = LanguageManager.getLanguage("ruby");
	//RoR File Extensions
	ruby_language.addFileExtension("rb");
	ruby_language.addFileExtension("ru");
    ruby_language.addFileExtension("ruby");
    ruby_language.addFileExtension("gemspec");
    ruby_language.addFileExtension("rake");
	//RoR Specific Files
	ruby_language.addFileName("Gemfile");
	ruby_language.addFileName("Rakefile");
    ruby_language.addFileName("Guardfile");
	//Ruby Comments
	ruby_language.setLineCommentSyntax(["#"]);
	ruby_language.setBlockCommentSyntax("=begin\n", "\n=end");
    
    //EditorManager.registerInlineEditProvider();
    
	//ERB Refine
	var erb_language = LanguageManager.getLanguage("erb_html");
	//ERB File Extensions
    erb_language.addFileExtension("rhtml");
	erb_language.addFileExtension("html.erb");
	erb_language.addFileExtension("htm.erb");
	erb_language.addFileExtension("erb");
	//ERB Comments
	//erb_language.setBlockCommentSyntax("<%#", "%>");
    
	//HAML Definition
	LanguageManager.defineLanguage("haml", {
		name: "HAML",
		mode: "haml",
		//HAML Extensions
		fileExtensions: ["haml", "html.haml", "htm.haml"],
		lineComment: ["-#"]
	});
    /* ryuk87 END */
    
    
    //SLIM Definition
    require('./src/mode/slim'); //Custom slim definition file
    LanguageManager.defineLanguage('slim', {
        name: "Slim",
        mode: "slim",
        fileExtensions: ['slim'],
        lineComment: ['/']
    });
    
    //Erubis Definition
    require('./src/mode/erubis'); //Custom erubis definition file
    LanguageManager.defineLanguage("erubis", {
		name: "Erubis",
		mode: "erubis",
		//HAML Extensions
		fileExtensions: 
            ["erb", "htm.erb", "html.erb", "erubis"],
		blockComment: ["<!--", "-->"]
	});
    
    
    /*var util = require('util'),
        exec = require('child_process').exec,
        child;
    
    child = exec('cat *.js bad_file | wc -l', // command line argument directly in string
      function (error, stdout, stderr) {      // one easy function to capture data/errors
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    }); */
    
    //window.console.log(require);
    //window.console.log(brackets);
    
});
