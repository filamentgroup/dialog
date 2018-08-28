(function(){
	var $ = jQuery;
	if( location.hash !== "" ){
		throw "hash must be clear to start the tests";
	}

	function debugEqual(a, b){
		debugger;
		equal(a,b);
	}

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
	};

	// we have to give the browser the time to trigger a hashchange
	// so there's no mixup
	function closeInstance($dialog, teardown){
		$("#dialog").trigger( "dialog-close" );
		setTimeout(function(){
      if(teardown){ commonTeardown() };
			start();
		}, 400);
	}

	// NOTE this must come after the first test so that the init of the dialog
	// comes from the page's enhance event
	module( "init", {
		setup: commonSetup,
		teardown: commonTeardown
	});

	asyncTest("should go back to dialog after closing the dialog ", function(){
		if( !Dialog.useHash ){
			expect(1);
			ok("Hash use is disabled");
			return start();
		}
		expect(3);
    var isOpen = $instance.data("dialog").isOpen;

    function testSeq(){
      equal(location.hash, "#dialog-dialog", "#dialog-dialog hash");

		  $(window).one( "hashchange", function(){
			  equal(location.hash, "", "no hash");

			  $(window).one("hashchange", function(){
					equal(location.hash, "#dialog-dialog", "#dialog-dialog hash again");
          start();
			  });

		    $instance.trigger( "dialog-open" );
		  });

		  $instance.trigger( "dialog-close" );
    }

    if(!isOpen) {
      $(window).one("hashchange", testSeq);
		  $instance.trigger( "dialog-open" );
    } else {
      testSeq();
    }
	});

	// TODO move to `dialog.js` tests
	test("should prevent double init", function(){
		if( !Dialog.useHash ){
			expect(1);
			ok("Hash use is disabled");
			return start();
		}
		// the `isOpen` propery of the dialog object is set
		// to `false` at the end of init, we check that it never gets there
		$instance.data("dialog").hash = "foo";
		$instance.dialog();
		equal($instance.data("dialog").hash, "foo");
	});

	asyncTest("should append dialog name to hash for nested dialogs", function(){
		if( !Dialog.useHash ){
			expect(1);
			ok("Hash use is disabled");
			return start();
		}
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
		if( !Dialog.useHash ){
			expect(1);
			ok("Hash use is disabled");
			return start();
		}
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
