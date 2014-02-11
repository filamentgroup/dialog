(function( $, window ) {
	var $instance;

	commonSetup = function() {
		$instance = $( "#dialog" );
	};

	module( "opening", {
		setup: commonSetup,
		teardown: function() {
			$instance.trigger( "dialog-close" );
			$instance.off( "dialog-opened" );
		}
	});

	test( "with the link", function() {
		var $link = $( $instance.find("a").attr( "href" ) );
		ok( !$instance.is(":visible") );
		$link.trigger( "click" );
		ok( $instance.is(":visible") );
	});

	test( "with a trigger", function() {
		$instance.one( "dialog-opened", function(){
			ok( $instance.is(":visible") );
		});

		ok( !$instance.is(":visible") );
		$instance.trigger( "dialog-open" );
	});
})( jQuery, this );
