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
			nullHash = "dialog",
			doc = w.document,
			docElem = doc.documentElement,
			body = doc.body,
			$html = $( docElem );

		return this.each(function(){

			var $el = $( this ),
				scroll = 0,
				focused = null,
				isOpen = false;

			$el.appendTo( body );

			function open( e ){
				scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || ( body && body.scrollY ) );

				$el[ 0 ].style.height = body.clientHeight + "px";

				$el
					.addClass( openClass )
					.children( 0 )[ 0 ].style.top = scroll + "px";

				$html.addClass( openClass );
				isOpen = true;
				location.hash = nullHash;
				if( doc.activeElement ){
					focused = doc.activeElement;
				}
				$el.children( 0 )[ 0 ].focus();
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
				.wrapInner( "<div class='"+ contentClass +"' role='dialog' tabindex='0'></div>" )
				.on( "open", open )
				.on( "close", close )
				.on( "click", function( e ){
					if( $( e.target ).is( "." + closeClass ) || $el.is( e.target ) ){
						w.history.back();
						e.preventDefault();
					}
				});

			$( w )
				// close on hashchange if open (supports back button closure)
				.on( "hashchange", function( e ){
					var hash = w.location.hash.replace( "#", "" );

					if( hash !== nullHash && isOpen ){
						close();
					}
				});

			$( doc )
				// open on matching a[href=#id] click
				.on( "click", function( e ){
					if( !isOpen && $( e.target ).is( "a" ) && $el.is( $( e.target ).attr( "href" ) ) ){
						open();
						e.preventDefault();
					}
				})
				// close on escape key
				.on( "keyup", function( e ){
					if( isOpen && e.which === 27 ){
						close();
					}
				});
		});
	};

	// auto-init
	$(function(){
		$( ".dialog" ).dialog();
	});

}( this, jQuery ));