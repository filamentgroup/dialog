(function(){
	var $ = jQuery;
	if( location.hash !== "" ){
		throw "hash must be clear to start the tests";
	}

	// force the hash to test init
	location.hash = "#nohist-dialog";

	var $doc, instance, $instance, $nested, $nohist, commonSetup, commonTeardown;

	commonSetup = function() {
		$nohist = $( "#nohist" );

		if( $nohist.data("dialog") ) {
			$nohist.data( "dialog" ).destroy();
		}


	};

	commonTeardown = function() {
		$nohist.unbind( "dialog-closed" );
		$nohist.unbind( "dialog-opened" );

		$nohist.data( "dialog" ).destroy();
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
		$nohist = $(event.target).data( "dialog" ).$el;
		initOpened = event.target;
	});

	asyncTest("nohist dialog should open on init if hash is present", function(){
		ok(!initOpened);
		start();
	});
})();
