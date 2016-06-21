(function( $, window ) {
	if(location.hash !== ""){
		throw "Hash must be empty for tests to work properly";
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

	module( "opening", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	var openTest = function( open ) {
		$instance.one( "dialog-opened", function(){
			ok( $instance.is(".dialog-open") );
			closeInstance();
		});

		ok( !$instance.is(".dialog-open") );

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
			equal( location.hash.indexOf("#dialog-dialog"), 0 );
			closeInstance();
		});

		ok( !$instance.is(".dialog-open") );
		$instance.trigger( "dialog-open" );
	});

	module( "background", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	test( "is added to the body", function() {
		equal($( "body" ).find( ".dialog-background" ).length ,1 );
	});

	module( "closing", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	var closeTest = function( close ) {
		expect( 3 );

		$instance.one( "dialog-opened", function(){
			ok( $instance.is(".dialog-open") );
			close();
		});

		$instance.one( "dialog-closed", function(){
			ok( !$instance.is(".dialog-open") );
			start();
		});

		ok( !$instance.is(".dialog-open") );
		$instance.trigger( "dialog-open" );
	};

	asyncTest( "using trigger makes the dialog invisible", function() {
		window.foo = true;
		closeTest(function() {
			$instance.trigger( "dialog-close" );
		});
	});

	asyncTest( "using the back button makes the dialog invisible", function() {
		closeTest(function() {
			window.history.back();
		});
	});

	// TODO, can't test with the current version of shoestring
	// asyncTest( "using the escape key makes the dialog invisible", function() {
	//	var keyupEvent = {
	//		type: "keyup",
	//		timestamp: (new Date()).getTime()
	//	};

	//	keyupEvent.which = 27;

	//	closeTest(function() {
	//		$( document ).trigger( keyupEvent );
	//	});
	// });

	asyncTest( "closing an open dialog reverts the hash", function() {
		var hash = location.hash;

		$(window).one("hashchange", function(){
			equal(location.hash.indexOf("#dialog-dialog"), 0);

			$(window).one("hashchange", function(){
				equal(location.hash, hash);
				start();
			});

			$instance.trigger("dialog-close");
		});

		$instance.trigger("dialog-open");
	});

	asyncTest( "closing an open dialog doesn't clear other hash", function() {
		$(window).one("hashchange", function(){
			equal(location.hash.indexOf("#dialog-dialog"), 0);

			$instance.one("dialog-closed", function(){
				// the hash should not have changed ...
				equal(location.hash, "#foo");

				// ... but the dialog should be closed
				ok( !$instance.is(".dialog-open") );
				start();
			});

			location.hash = "foo"
			$instance.trigger("dialog-close");
		});

		$instance.trigger("dialog-open");
	});

})( window.jQuery || window.shoestring, this );
