(function( $, window ) {
	var $instance;

	commonSetup = function() {
		$instance = $( "#dialog" );
	};

	module( "link open", {
		setup: commonSetup,
		teardown: function() {
			$instance.trigger( "dialog-close" );
		}
	});

	test( "", function() {
		var $link = $( $instance.find("a").attr( "href" ) );
		ok( !$instance.is(":visible") );
		$link.trigger( "click" );
		ok( $instance.is(":visible") );
	});
})( jQuery, this );
