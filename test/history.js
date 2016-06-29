(function( $, window ) {
	// force the hash to test init
	location.hash = "#dialog-dialog";

	var $doc, $instance, commonSetup, commonTeardown;

	commonSetup = function() {
		$instance = $( "#dialog" );

		if( $instance.data("instance") ) {
			$instance.data( "instance" ).destroy();
		}

		$instance.dialog();
	};

	commonTeardown = function() {
		$instance.unbind( "dialog-closed" );
		$instance.unbind( "dialog-opened" );

		$instance.data( "instance" ).destroy();
	};

	// we have to give the browser the time to trigger a hashchange
	// so there's no mixup
	function closeInstance(){
		$instance.trigger( "dialog-close" );
		setTimeout(function(){
			start()
		}, 400);
	}

	module( "init", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	var initOpened;

	$(window).bind("dialog-opened", function(event){
		initOpened = event.target;
	});

	asyncTest("should open on if hash is correct", function(){
		ok(initOpened);
		start();
	});

	// TODO move to `dialog.js` tests
	test("should prevent double init", function(){
		// the `isOpen` propery of the dialog object is set
		// to `false` at the end of init, we check that it never gets there
		$instance.data("dialog").isOpen = true;
		$instance.dialog();
		equal($instance.data("dialog").isOpen, true);
	})
})(jQuery, this);
