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
				var dialogLabelledBy =  $a.attr( "data-dialog-labeledby" ) || "";
				var dialogLabel =  $a.attr( "data-dialog-label" ) || "";

				var dialogNoHistory =
					$a.attr( "data-dialog-history" ) === "false" ||
					!w.componentNamespace.Dialog.history;

				var id;

				if( linkHref ) {
					id = encodeURIComponent(linkHref);
				}

				// if there are two links in the page that point to the same url
				// then the same dialog will be reused and the content updated
				var $existing = $("[id='" + id + "']");
				if( $existing.length ){
					$existing
						.html("")
						.append(content)
						.dialog()
						.trigger("enhance dialog-update");
					return;
				}

				$a
					.attr("href", "#" + id )
					.removeAttr( "data-dialog-link" );

				var $dialog = $( "<div class='dialog "+ dialogClasses +"' id='" + id + "' " + ( dialogNoHistory ? " data-dialog-history='false'" : "" ) + ( dialogLabel ? " aria-label='" + dialogLabel + "'" : "" ) + ( dialogLabelledBy ? " aria-labelledby='" + dialogLabelledBy + "'" : "" ) + "></div>" )
						.append( content )
						.appendTo( "body" )
						.dialog();

				function open(){
					$dialog.trigger( "dialog-open" );
				}

				// make sure the opener link is set as the focued item if one is not defined already
				var instance = $dialog.data( "dialog" );
				if( instance && !instance.focused ){
					instance.focused = $a[ 0 ];
				}

				if( iframe ){
					$dialog.find( "iframe" ).one( "load", open );
				}
				else {
					open();
				}

				$dialog.trigger( "enhance" );
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
		var $ajaxLink = $( 'a[href="' + decodeURIComponent(id) +'"][data-dialog-link], a[href="' + id +'"][data-dialog-link]' );
		// if the link specified nohistory, don't click it
		var nohistory =
			$ajaxLink.attr( "data-dialog-history" ) === "false" ||
			!w.componentNamespace.Dialog.history;

		var $dialogInPage = $( '.dialog[id="' + id + '"]' );
		if( $ajaxLink.length && !nohistory && !$dialogInPage.length ){
			$ajaxLink.eq( 0 ).trigger( "click" );
		}
	});

}( this, window.jQuery ));
