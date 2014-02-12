(function( $, window ) {
	var $doc, $instance, commonSetup, commonTeardown;

	commonSetup = function() {
		$instance = $( "#dialog" ).dialog();
	};

	$( document ).bind( "dialog-opened", function() {
		console.log( 'dialog-opened fired at doc' );
	});

	commonTeardown = function() {
		$instance.unbind( "dialog-closed" );
		$instance.unbind( "dialog-opened" );
		$instance.trigger( "dialog-close" );
	};

	module( "opening", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	asyncTest( "with the link", function() {
		var $link = $( $instance.find("a").attr( "href" ) );

		$instance.one( "dialog-opened", function(){
			ok( $instance.is(":visible") );
			start();
		});

		ok( !$instance.is(":visible") );
		$link.trigger( "click" );
	});

	asyncTest( "with a trigger", function() {
		$instance.one( "dialog-opened", function(){
			ok( $instance.is(":visible") );
			start();
		});

		ok( !$instance.is(":visible") );
		$instance.trigger( "dialog-open" );
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

	test( "makes the dialog invisible", function() {
		$instance.one( "dialog-opened", function(){
			ok( $instance.is(":visible") );
		});

		$instance.one( "dialog-closed", function(){
			ok( !$instance.is(":visible") );
			start();
		});

		ok( !$instance.is(":visible") );
		$instance.trigger( "dialog-open" );
	});
})( jQuery, this );
