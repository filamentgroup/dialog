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
			var link = $a.is( "[data-dialog-link]" );
			var iframe = $a.is( "[data-dialog-iframe]" );

			function createDialog(content){
				var linkHref = $a.attr( "href" );
				var dialogClasses = $a.attr( "data-dialog-addclass" ) || "";
				var id;

				if( linkHref ) {
					id = linkHref;
				}

				$a
					.attr("href", "#" + id )
					.removeAttr( "data-dialog-link" );

				var $dialog = $( "<div class='dialog "+ dialogClasses +"' id='" + id + "'></div>" )
						.append( content )
						.appendTo( "body" )
						.trigger( "enhance" );

				function open(){
					$dialog.trigger( "dialog-open" );
				}

				if( iframe ){
					$dialog.find( "iframe" ).one( "load", open );
				}
				else {
					open();
				}
			}

			if( link ){
				var url = $a.attr( "href" );

				// get content either from an iframe or not
				if( $a.is( "[data-dialog-iframe]" ) ){
					createDialog( "<iframe src='"+ url +"' class='dialog-iframe'></iframe>" );
				}
				else {
					$.get( url, createDialog );
				}

				e.preventDefault();
			}
		});

	// if the hash matches an ajaxlink's url, open it by triggering a click on the ajaxlink
	$( w ).bind( "hashchange load", function(){
		var hash = w.location.hash.split( "#" ).pop();
		var id = hash.replace( /-dialog$/, "" );
		var $ajaxLink = $( 'a[href="' + id +'"][data-dialog-link]' );
		// if the link specified nohistory, don't click it
		var nohistory = $ajaxLink.is( "[data-dialog-nohistory]" );
		var $dialogInPage = $( '.dialog[id="' + id + '"]' );
		if( $ajaxLink.length && !nohistory && !$dialogInPage.length ){
			$ajaxLink.eq( 0 ).trigger( "click" );
		}
	});

}( this, window.jQuery ));
