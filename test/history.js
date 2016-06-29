(function( $, window ) {
	if(location.hash !== "#dialog-dialog"){
		throw "Hash must be set to #dialog-dialog for tests to cover initial load behavior";
	}

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

	var initOpened;

	$(window).bind("dialog-opened", function(event){
		initOpened = event.target;
	});

	asyncTest("should open on if hash is correct", function(){
		ok(initOpened);
		start();
	});
})(jQuery, this);
