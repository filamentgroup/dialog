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
		this.$background = !this.$el.is( '[data-nobg]' ) ?
			$( doc.createElement('div') ).addClass( cl.bkgd ).appendTo( "body") :
			$( [] );
		this.hash = this.$el.attr( "id" ) + "-dialog";

		this.isOpen = false;
		this.positionMedia = this.$el.attr( 'data-set-position-media' );
		this.isTransparentBackground = this.$el.is( '[data-transbg]' );
	};

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

	Dialog.prototype.isSetScrollPosition = function() {
		return !this.positionMedia ||
			( w.matchMedia && w.matchMedia( this.positionMedia ).matches );
	};

	Dialog.prototype.destroy = function() {
		this.$background.remove();
	};

	Dialog.prototype.open = function() {
		if( this.$background.length ) {
			this.$background[ 0 ].style.height = Math.max( docElem.scrollHeight, docElem.clientHeight ) + "px";
		}
		this.$el.addClass( cl.open );
		this.$background.addClass( cl.bkgdOpen );
		this.$background.attr( "id", this.$el.attr( "id" ) + "-background" );
		this._setBackgroundTransparency();

		if( this.isSetScrollPosition() ) {
			this.scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || docElem.scrollTop || ( body && body.scrollY ) || 0 );
			this.$el[ 0 ].style.top = this.scroll + "px";
		} else {
			this.$el[ 0 ].style.top = '';
		}

		$html.addClass( cl.open );
		this.isOpen = true;

		window.location.hash = this.hash;

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

		this.$el.removeClass( cl.open );

		this.$background.removeClass( cl.bkgdOpen );
		$html.removeClass( cl.open );

		if( this.focused ){
			this.focused.focus();
		}

		if( this.isSetScrollPosition() ) {
			w.scrollTo( 0, this.scroll );
		}

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
				var linkId = $a.attr( "id" );
				var dialogClasses = $a.attr( "data-dialog-addclass" ) || "";
				var id;

				if( linkId ) {
					id = linkId + "-dialog";
				} else {
					id = "dialog-" + new Date().getTime();
				}

				$a
					.attr("href", "#" + id )
					.removeAttr( "data-dialog-link" );

				var $dialog = $( "<div class='dialog "+ dialogClasses +"' id='" + id + "'></div>" )
						.append( content )
						.appendTo( "body" )
						.dialog();

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

}( this, window.jQuery ));

(function( w, $ ){
  var Dialog = w.componentNamespace.Dialog, doc = document;

	$.fn.dialog = function(){
		return this.each(function(){
			var $el = $( this ), dialog = new Dialog( this );

			$el.data( "instance", dialog );

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
						w.history.back();
						e.preventDefault();
					}
				});

			dialog.$background.bind( "click", function() {
				w.history.back();
			});

			// close on hashchange if open (supports back button closure)
			$( w ).bind( "hashchange", function(){
				var hash = w.location.hash.replace( "#", "" );

				if( hash !== dialog.hash ){
					dialog.close();
				}
			});

			// open on matching a[href=#id] click
			$( doc ).bind( "click", function( e ){
				var $matchingDialog, $a;

				$a = $( e.target ).closest( "a" );

				if( !dialog.isOpen && $a.length && $a.attr( "href" ) ){

					// catch invalid selector exceptions
					try {
						$matchingDialog = $( $a.attr( "href" ) );
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

	// auto-init
	$(function(){
		$( ".dialog" ).dialog();
	});
}( this, window.jQuery ));
