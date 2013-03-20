/*
 * Simple jQuery Dialog
 * https://github.com/filamentgroup/dialog
 *
 * Copyright (c) 2013 Filament Group, Inc.
 * Author: @scottjehl
 * Licensed under the MIT, GPL licenses.
 */

(function( w, $ ){
	$.fn.dialog = function(){

		var openClass = "dialog-open",
			contentClass = "dialog-content",
			closeClass = "dialog-close",
			backgroundClass = "dialog-background",
			nullHash = "dialog",
			doc = w.document,
			docElem = doc.documentElement,
			body = doc.body,
			$html = $( docElem ),
			$background = $( doc.createElement( 'div' ) ).addClass( backgroundClass );

		return this.each(function(){

			var $el = $( this ),
				scroll = 0,
				focused = null,
				isOpen = false;

			$background.appendTo( body );

			function open( e ){
				scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || ( body && body.scrollY ) );

				$background[ 0 ].style.height = body.clientHeight + "px";

				$el
					.addClass( openClass )
					[ 0 ].style.top = scroll + "px";

				$html.addClass( openClass );
				isOpen = true;
				location.hash = nullHash;
				if( doc.activeElement ){
					focused = doc.activeElement;
				}
				$el[ 0 ].focus();
			}

			function close(){
				$el.removeClass( openClass );
				$html.removeClass( openClass );
				if( focused ){
					focused.focus();
				}
				w.scrollTo( 0, scroll );
				isOpen = false;
			}

			$el
				.addClass( contentClass )
				.attr( "role", "dialog" )
				.attr( "tabindex", 0 )
				.bind( "open", open )
				.bind( "close", close )
				.bind( "click", function( e ){
					if( $( e.target ).is( "." + closeClass ) ){
						w.history.back();
						e.preventDefault();
					}
				});

			$background.bind( "click", function( e ) {
				w.history.back();
			});

			$( w )
				// close on hashchange if open (supports back button closure)
				.bind( "hashchange", function( e ){
					var hash = w.location.hash.replace( "#", "" );

					if( hash !== nullHash && isOpen ){
						$el.trigger( "close" );
					}
				});

			$( doc )
				// open on matching a[href=#id] click
				.bind( "click", function( e ){
					if( !isOpen && $( e.target ).is( "a" ) && $el.is( $( e.target ).attr( "href" ) ) ){
						$el.trigger( "open" );
						e.preventDefault();
					}
				})
				// close on escape key
				.bind( "keyup", function( e ){
					if( isOpen && e.which === 27 ){
						$el.trigger( "close" );
					}
				});
		});
	};

	// auto-init
	$(function(){
		$( ".dialog" ).dialog();
	});

}( this, jQuery ));