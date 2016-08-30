/*
 * Simple jQuery Dialog
 * https://github.com/filamentgroup/dialog
 *
 * Copyright (c) 2013 Filament Group, Inc.
 * Author: @scottjehl
 * Contributors: @johnbender, @zachleat
 * Licensed under the MIT, GPL licenses.
 */

window.jQuery = window.jQuery || window.shoestring;

(function( w, $ ){
	w.componentNamespace = w.componentNamespace || w;

	var pluginName = "dialog", cl, ev,
		doc = w.document,
		docElem = doc.documentElement,
		body = doc.body,
		$html = $( docElem );

	var Dialog = w.componentNamespace.Dialog = function( element ){
		this.$el = $( element );

		// prevent double init
		if( this.$el.data( pluginName ) ){
			return this.$el.data( pluginName );
		}

		// record init
		this.$el.data( pluginName, this );

		this.$background = !this.$el.is( '[data-nobg]' ) ?
			$( doc.createElement('div') ).addClass( cl.bkgd ).appendTo( "body") :
			$( [] );

		// when dialog first inits, save a reference to the initial hash so we can know whether
		// there's room in the history stack to go back or not when closing
		this.initialLocationHash = w.location.hash;

		// the dialog's url hash is different from the dialog's actual ID attribute
		// this is because pairing the ID directly makes the browser jump to the top
		// of the dialog, rather than allowing us to space it off the top of the
		// viewport. also, if the dialog has a data-history attr, this property will
		// prevent its findability for onload and hashchanges
		this.nohistory =
			this.$el.attr( 'data-dialog-history' ) === "false" || !Dialog.history;

		// use the identifier and an extra tag for hash management
		this.hash = this.$el.attr( "id" ) + "-dialog";

		// if won't pop up the dialog on initial load (`nohistory`) the user MAY
		// refresh a url with the dialog id as the hash then a change of the hash
		// won't be recognized by the browser when the dialog comes up and the back
		// button will return to the referring page. So, when nohistory is defined,
		// we append a "unique" identifier to the hash.
		this.hash += this.nohistory ? "-" + Date.now().toString() : "" ;

		this.isOpen = false;
		this.isTransparentBackground = this.$el.is( '[data-transbg]' );
	};

  // default to tracking history with the dialog
  Dialog.history = true;

	Dialog.events = ev = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		close: pluginName + "-close",
		closed: pluginName + "-closed"
	};

	Dialog.classes = cl = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		content: pluginName + "-content",
		close: pluginName + "-close",
		closed: pluginName + "-closed",
		bkgd: pluginName + "-background",
		bkgdOpen: pluginName + "-background-open",
		bkgdTrans: pluginName + "-background-trans"
	};

	Dialog.selectors = {
		close: "." + Dialog.classes.close + ", [data-close], [data-dialog-close]"
	};

	Dialog.prototype.destroy = function() {
		// clear init for this dom element
		this.$el.data()[pluginName] = undefined;
		this.$background.remove();
	};

	Dialog.prototype.open = function() {
		if( this.isOpen ){
			return;
		}
		if( this.$background.length ) {
			this.$background[ 0 ].style.height = Math.max( docElem.scrollHeight, docElem.clientHeight ) + "px";
		}
		this.$el.addClass( cl.open );
		this.$background.addClass( cl.bkgdOpen );
		this.$background.attr( "id", this.$el.attr( "id" ) + "-background" );
		this._setBackgroundTransparency();

		this.scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || docElem.scrollTop || ( body && body.scrollY ) || 0 );
		this.$el[ 0 ].style.top = this.scroll + "px";

		$html.addClass( cl.open );
		this.isOpen = true;

		var cleanHash = w.location.hash.replace( /^#/, "" );
		var lastHash = w.location.hash.split( "#" ).pop();

		if( cleanHash.indexOf( "-dialog" ) > -1 && lastHash !== this.hash ){
			w.location.hash += "#" + this.hash;
		}
		else if( lastHash !== this.hash ) {
			w.location.hash = this.hash;
		}

		if( doc.activeElement ){
			this.focused = doc.activeElement;
		}
		this.$el[ 0 ].focus();

		this.$el.trigger( ev.opened );
	};

	Dialog.prototype._setBackgroundTransparency = function() {
		if( this.isTransparentBackground ){
			this.$background.addClass( cl.bkgdTrans );
		}
	};

	Dialog.prototype.close = function(){
		if( !this.isOpen ){
			return;
		}

		// if close() is called directly and the hash for this dialog is at the end
		// of the url, then we need to change the hash to remove it, either by going
		// back if we can, or by adding a history state that doesn't have it at the
		// end
		if( window.location.hash.split( "#" ).pop() === this.hash ){
			// let's check if the first segment in the hash is the same as the first
			// segment in the initial hash if not, it's safe to use back() to close
			// this out and clean the hash up
			var firstHashSegment = window.location.hash.split( "#" )[ 1 ];
			var firstInitialHashSegment = this.initialLocationHash.split( "#" )[ 1 ];
			if( firstHashSegment && firstInitialHashSegment && firstInitialHashSegment !== firstHashSegment ){
				window.history.back();
			}
			// otherwise, if it's the same starting hash as it was at init time, we
			// can't trigger back to close the dialog, as it might take us elsewhere.
			// so we have to go forward and create a new hash that does not have this
			// dialog's hash at the end
			else {
				var escapedRegexpHash = this
            .hash
            .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");

				window.location.hash = window
          .location
          .hash
          .replace( new RegExp( "#" + escapedRegexpHash + "$" ), "" );
			}
			return;
		}

		this.$el.removeClass( cl.open );

		this.$background.removeClass( cl.bkgdOpen );
		$html.removeClass( cl.open );

		if( this.focused ){
			this.focused.focus();
		}

		w.scrollTo( 0, this.scroll );

		this.isOpen = false;

		this.$el.trigger( ev.closed );
	};
}( this, window.jQuery ));

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
						.trigger("enhance");
					return;
				}

				$a
					.attr("href", "#" + id )
					.removeAttr( "data-dialog-link" );

				var $dialog = $( "<div class='dialog "+ dialogClasses +"' id='" + id + "' " + ( dialogNoHistory ? " data-dialog-history='false'" : "" ) + "></div>" )
						.append( content )
						.appendTo( "body" )
						.trigger( "enhance" );

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
		var $ajaxLink = $( 'a[href="' + decodeURIComponent(id) +'"][data-dialog-link]' );
		if( !$ajaxLink.length ){
			$ajaxLink = $( 'a[href="' + id +'"][data-dialog-link]' );
		}
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
