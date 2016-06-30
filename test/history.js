(function( $, window ) {
	if( location.hash !== "" ){
		throw "hash must be clear to start the tests";
	}

	// force the hash to test init
	location.hash = "#dialog-dialog";

	var $doc, instance, $instance, $nested, commonSetup, commonTeardown;

	commonSetup = function() {
		$instance = $( "#dialog" );
		$nested = $( "#nested-dialog" );

		if( $instance.data("dialog") ) {
			$instance.data( "dialog" ).destroy();
		}

		if( $nested.data("dialog") ) {
			$nested.data( "dialog" ).destroy();
		}


		$instance.dialog();
		$nested.dialog();
	};

	commonTeardown = function() {
		$instance.unbind( "dialog-closed" );
		$instance.unbind( "dialog-opened" );

		$instance.data( "dialog" ).destroy();
		$nested.data( "dialog" ).destroy();
	};

	// we have to give the browser the time to trigger a hashchange
	// so there's no mixup
	function closeInstance(){
		$instance.trigger( "dialog-close" );
		setTimeout(function(){
			start()
		}, 400);
	}

	var initOpened;

	$(window).bind("dialog-opened", function(event){
		initOpened = event.target;
	});

	asyncTest("should open on init if hash is correct", function(){
		ok(initOpened);
		start();
	});

	// NOTE this must come after the first test so that the init of the dialog
	// comes from the page's enhance event
	module( "init", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	// TODO move to `dialog.js` tests
	test("should prevent double init", function(){
		// the `isOpen` propery of the dialog object is set
		// to `false` at the end of init, we check that it never gets there
		$instance.data("dialog").isOpen = true;
		$instance.dialog();
		equal($instance.data("dialog").isOpen, true);
	})

	asyncTest("should append dialog name to hash for nested dialogs", function(){
		$instance.trigger( "dialog-open" );
		$instance.find( "#nested-dialog-anchor" ).trigger( "click" );
		equal("#dialog-dialog#nested-dialog-dialog", location.hash);
		start();
	});
})(jQuery, this);
