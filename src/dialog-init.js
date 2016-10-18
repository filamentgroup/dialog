(function( w, $ ){
	var Dialog = w.componentNamespace.Dialog,
		doc = w.document,
		pluginName = "dialog";

	$.fn[ pluginName ] = function(){
		return this.each(function(){
			var $el = $( this );

			// prevent double init
			if( $el.data( "dialog" ) ){
				return;
			}

			var dialog = new Dialog( this );

			$el.addClass( Dialog.classes.content )
				.attr( "role", "dialog" )
				.attr( "tabindex", 0 )
				.bind( Dialog.events.open, function(){
					dialog.open();
				})
				.bind( Dialog.events.close, function(){
					dialog.close();
				})
				.bind( "click", function( e ){
					if( $(e.target).closest(Dialog.selectors.close).length ){
						e.preventDefault();
						dialog.close();
					}
				});

			dialog.$background.bind( "click", function() {
				dialog.close();
			});

			var onHashchange;

			// on load and hashchange, open the dialog if its hash matches the last part of the hash, and close if it doesn't
			$( w ).bind( "hashchange", onHashchange = function(){
				var hash = w.location.hash.split( "#" ).pop();

				// if the hash matches this dialog's, open!
				if( hash === dialog.hash ){
					if( !dialog.nohistory ){
						dialog.open();
					}
				}
				// if it doesn't match...
				else {
					dialog.close();
				}
			});

			onHashchange();

			// open on matching a[href=#id] click
			$( doc ).bind( "click", function( e ){
				var $matchingDialog, $a;

				$a = $( e.target ).closest( "a" );


				if( !dialog.isOpen && $a.length && $a.attr( "href" ) ){
					var id = $a.attr( "href" ).replace( /^#/, "" );

					// catch invalid selector exceptions
					try {
						// Attempt to find the matching dialog at the same id or at the
						// encoded id. This allows matching even when href url ids are being
						// changed back and forth between encoded and decoded forms.
						$matchingDialog =
							$( "[id='" + id + "'],	[id='" + encodeURIComponent(id) + "']" );
					} catch ( error ) {
						// TODO should check the type of exception, it's not clear how well
						//      the error name "SynatxError" is supported
						return;
					}

					if( $matchingDialog.length && $matchingDialog.is( $el ) ){
						$matchingDialog.trigger( Dialog.events.open );
						e.preventDefault();
					}
				}
			});

			// close on escape key
			$( doc ).bind( "keyup", function( e ){
				if( e.which === 27 ){
					dialog.close();
				}
			});

			window.focusRegistry.register(dialog);
		});
	};

	// auto-init on enhance
	$( w.document ).bind( "enhance", function( e ){
		var target = e.target === w.document ? "" : e.target;
		$( "." + pluginName, e.target ).add( target ).filter( "." + pluginName )[ pluginName ]();
	});

	function FocusRegistry(){
		var self = this;

		this.registry = [];

		$(window.document).bind("focusin", function(event){
			self.check(event);
		});
	}

	FocusRegistry.prototype.register = function(obj){
		if( !obj.checkFocus ){
			throw new Error( "Obj must implement `checkFocus`" );
		}

		if( !obj.stealFocus ){
			throw new Error( "Obj must implement `stealFocus`" );
		}

		this.registry.push(obj);
	};

	FocusRegistry.prototype.unregister = function(obj){
		for(var i = 0; i < this.registry.length; i++ ){
			if(this.registry[i] === obj){
				break;
			}
		}

		this.registry.splice(i, 1);
	};

	FocusRegistry.prototype.check = function(event){
		var stealing = [];

		// for all the registered components
		for(var i = 0; i < this.registry.length; i++){

			// if a given component wants to steal the focus, record that
			if( this.registry[i].checkFocus(event) ){
				stealing.push(this.registry[i]);
			}
		}

		// if more than one component wants to steal focus throw an exception
		if( stealing.length > 1 ){
			throw new Error("Two components are attempting to steal focus.");
		}

		// otherwise allow the first component to steal focus
		if(stealing[0]) {
			event.preventDefault();

			// let this event stack unwind and then steal the focus
			// which will again trigger the check above
			setTimeout(function(){
				stealing[0].stealFocus(event);
			});
		}
	};

	// constructor in namespace
	window.componentNamespace.FocusRegistry = FocusRegistry;

	// singleton
	window.focusRegistry = new FocusRegistry();
}( this, window.jQuery ));
