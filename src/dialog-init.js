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
						$matchingDialog = $( "[id='" + id + "']" );
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
		});
	};

  // auto-init on enhance
	$( w.document ).bind( "enhance", function( e ){
    var target = e.target === w.document ? "" : e.target;
		$( "." + pluginName, e.target ).add( target ).filter( "." + pluginName )[ pluginName ]();
	});
}( this, window.jQuery ));
