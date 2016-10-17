(function(){
	var $ = jQuery;
	if( location.hash !== "" ){
		throw "hash must be clear to start the tests";
	}

	function debugEqual(a, b){
		debugger;
		equal(a,b);
	}

	// force the hash to test init and to ensure that it's the initial hash value
	location.hash = "#dialog-dialog";

	var $doc, instance, $instance, $nested, $nohist, commonSetup, commonTeardown;

	commonSetup = function() {
		$instance = $( "#dialog" );
		$nested = $( "#nested" );
		$nohist = $( "#nohist" );

		if( $instance.data("dialog") ) {
			$instance.data( "dialog" ).destroy();
		}

		if( $nested.data("dialog") ) {
			$nested.data( "dialog" ).destroy();
		}

		if( $nohist.data("dialog") ) {
			$nohist.data( "dialog" ).destroy();
		}

		$instance.dialog();
		$nested.dialog();
		$nohist.dialog();
	};

	commonTeardown = function() {
		$instance.unbind( "dialog-closed" );
		$instance.unbind( "dialog-opened" );
		$nested.unbind( "dialog-closed" );
		$nested.unbind( "dialog-opened" );
		$nohist.unbind( "dialog-closed" );
		$nohist.unbind( "dialog-opened" );

		$instance.data( "dialog" ).destroy();
		$nested.data( "dialog" ).destroy();
		$nohist.data( "dialog" ).destroy();
		window.Focus.registry = [];
	};

	// we have to give the browser the time to trigger a hashchange
	// so there's no mixup
	function closeInstance($dialog){
		$dialog.trigger( "dialog-close" );
		setTimeout(function(){
			start()
		}, 400);
	}

	var initOpened;

	$(window).one("dialog-opened", function(event){
		$instance = $(event.target).data( "dialog" ).$el;
		initOpened = event.target;
	});

	asyncTest("should open on init if hash is correct", function(){
		ok(initOpened);
		closeInstance($instance);
	});

	// NOTE this must come after the first test so that the init of the dialog
	// comes from the page's enhance event
	module( "init", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	asyncTest("should go back to dialogback when closing the dialog ", function(){
		expect(3);
		$instance.trigger( "dialog-open" );
		equal(location.hash, "#dialog-dialog");

		$(window).one( "hashchange", function(){
			equal(location.hash, "");

			$(window).one("hashchange", function(){

				// TODO it's not clear why the hash value isn't reflecting the change
				//			 immediately
				setTimeout(function(){
					equal(location.hash, "#dialog-dialog");
					closeInstance($instance);
				}, 1000);
			});

			window.history.back();
		});

		$instance.trigger( "dialog-close" );
	});

	// TODO move to `dialog.js` tests
	test("should prevent double init", function(){
		// the `isOpen` propery of the dialog object is set
		// to `false` at the end of init, we check that it never gets there
		$instance.data("dialog").hash = "foo";
		$instance.dialog();
		equal($instance.data("dialog").hash, "foo");
	});

	asyncTest("should append dialog name to hash for nested dialogs", function(){
		expect(3);

		$instance.trigger( "dialog-open" );
		equal(location.hash, "#dialog-dialog");
		$instance.find( "#nested-dialog-anchor" ).trigger( "click" );
		equal(location.hash, "#dialog-dialog#nested-dialog");

		$nested.one("dialog-closed", function(){
			equal("#dialog-dialog", location.hash);
			closeInstance($instance);
		});

		 window.history.back();
	});

	asyncTest("nohist dialog should still work as normal after page load", function(){
		expect(2);

		var oldHash = location.hash;

		$nohist.trigger( "dialog-open" );
		equal(location.hash.indexOf(oldHash + "#nohist-dialog"), 0);
		$nohist.one("dialog-closed", function(){
			equal(oldHash, location.hash);
			closeInstance($nohist);
		});

		window.history.back();
	});
})();
