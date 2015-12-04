/*
 * Simple jQuery Dialog Linker
 * https://github.com/filamentgroup/dialog
 *
 * Copyright (c) 2013 Filament Group, Inc.
 * Author: @scottjehl
 * Licensed under the MIT, GPL licenses.
 */

(function( w, $ ){

	$( w.document )
		// open on matching a[href=#id] click
		.bind( "click", function( e ){

			var $a = $( e.target ).closest( "a" );

			if( $a.length && $a.is( "[data-dialog-link]" ) ){

				$.get( $a.attr( "href" ), function( content ){
					var linkId = $a.attr( "id" );
					var id;

					if( linkId ) {
						id = linkId + "-dialog";
					} else {
						id = "dialog-" + new Date().getTime();
					}

					$a
						.attr("href", "#" + id )
						.removeAttr( "data-dialog-link" );

					$( "<div class='dialog' id='" + id + "'></div>" )
							.append( content )
							.appendTo( "body" )
							.dialog()
							.trigger( "dialog-open" );
				});

				e.preventDefault();
			}
		});

}( this, window.jQuery ));
