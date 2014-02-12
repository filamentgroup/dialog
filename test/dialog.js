(function( $, window ) {
	var $doc, $instance, commonSetup, commonTeardown;

	commonSetup = function() {
		$instance = $( "#dialog" ).dialog();
	};

	commonTeardown = function() {
		$instance.unbind( "dialog-closed" );
		$instance.unbind( "dialog-opened" );
		$instance.trigger( "dialog-close" );
	};

	module( "opening", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	var openTest = function( open ) {
		$instance.one( "dialog-opened", function(){
			ok( $instance.is(":visible") );
			start();
		});

		ok( !$instance.is(":visible") );

		open();
	};

	asyncTest( "with the link", function() {
		var $link = $( $instance.find("a").attr( "href" ) );

		openTest(function() {
			$link.trigger( "click" );
		});
	});

	asyncTest( "with a trigger", function() {
		openTest(function() {
			$instance.trigger( "dialog-open" );
		});
	});

	asyncTest( "with trigger sets the hash to #dialog", function() {
		$instance.one( "dialog-opened", function(){
			equal( location.hash, "#dialog" );
			start();
		});

		ok( !$instance.is(":visible") );
		$instance.trigger( "dialog-open" );
	});

	module( "closing", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	var closeTest = function( close ) {
		expect( 3 );

		$instance.one( "dialog-opened", function(){
			ok( $instance.is(":visible") );
			$instance.trigger( "dialog-close" );
		});

		$instance.one( "dialog-closed", function(){
			ok( !$instance.is(":visible") );
			start();
		});

		ok( !$instance.is(":visible") );
		$instance.trigger( "dialog-open" );
	};

	asyncTest( "using trigger makes the dialog invisible", function() {
		closeTest(function() {
			$instance.trigger( "dialog-close" );
		});
	});

	asyncTest( "using the back button makes the dialog invisible", function() {
		closeTest(function() {
			window.history.back();
		});
	});

	asyncTest( "using the escapte key makes the dialog invisible", function() {
		var keyupEvent = $.Event( "keyup" );

		keyupEvent.which = 27;

		closeTest(function() {
			$( document ).trigger( keyupEvent );
		});
	});
})( jQuery, this );
