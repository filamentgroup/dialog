(function( $, window ) {
	var instance;

	module("Focus", {
		setup: function(){
			instance = new window.componentNamespace.FocusRegistry();
		}
	});

	test("should register many objects", function(){
		expect(2);

		var obj = {
			checkFocus: function(){
				ok( "focus check called" );
				return false;
			},
			stealFocus: function(){}
		};

		instance.register(obj);
		instance.register(obj);

		instance.check({ preventDefault: function(){} });
	});

	test("should throw an exception on two matches", function(){
		expect( 3 );
		var obj = {
			checkFocus: function(){
				ok( "focus check called" );
				return true;
			},
			stealFocus: function(){
				ok( false );
			}
		};

		instance.register(obj);
		instance.register(obj);

		throws(function(){
			instance.check({ preventDefault: function(){} });
		});
	});

	test("should throw an execption if an object doesn't meet reqs", function(){
		expect( 3 );
		var obj = {
			checkFocus: function(){}

			// missing `stealFocus`
		};

		throws(function(){
			instance.register(obj);
		});

		obj = {
			stealFocus: function(){}

			// missing `checkFocus`
		};

		throws(function(){
			instance.register(obj);
		});

		obj = {
			// missing `checkFocus`
			// missing `stealFocus`
		};

		throws(function(){
			instance.register(obj);
		});
	});


	asyncTest("should call stealFocus on checkFocus", function(){
		expect( 2 );

		var obj = {
			checkFocus: function(){
				ok( true, "focus check called" );
				return true;
			},

			stealFocus: function(){
				ok( true, "focus steal called" );
				start();
			}
		};

		instance.register(obj);

		instance.check({ preventDefault: function(){} });
	});

	asyncTest("should not call stealFocus without checkFocus", function(){
		expect( 1 );
		var obj = {
			checkFocus: function(){
				ok( true, "focus check called" );
				return false;
			},
			stealFocus: function(){
				ok( false, "focus steal called" );
			}
		};

		instance.register(obj);

		instance.check({ preventDefault: function(){} });

		// give the focus event stack time to unwind and time
		// for the timeout in `check` to fire if it's going to
		setTimeout(function(){
			start();
		}, 1000);
	});

	test("should remove object from registry", function(){
		var obj1 = {
			checkFocus: function(){},
			stealFocus: function(){}
		};

		var obj2 = {
			checkFocus: function(){},
			stealFocus: function(){},
			foo: "foo"
		};

		instance.register(obj1);
		instance.register(obj1);
		instance.register(obj2);

		equal(instance.registry.length, 3);
		equal(instance.registry[0], obj1);
		equal(instance.registry[1], obj1);
		equal(instance.registry[2], obj2);

		instance.unregister(obj1);

		equal(instance.registry.length, 1);
		equal(instance.registry[0], obj2);
	});
})(window.jQuery, window);
