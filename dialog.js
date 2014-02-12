/*
 * Simple jQuery Dialog
 * https://github.com/filamentgroup/dialog
 *
 * Copyright (c) 2013 Filament Group, Inc.
 * Author: @scottjehl
 * Licensed under the MIT, GPL licenses.
 */

(function( w, $ ){
	$.fn.dialog = function( transbg ){

		var pluginName = "dialog",
			cl = {
				open: pluginName + "-open",
				opened: pluginName + "-opened",
				content: pluginName + "-content",
				close: pluginName + "-close",
				closed: pluginName + "-closed",
				bkgd: pluginName + "-background",
				bkgdOpen: pluginName + "-background-open",
				bkgdTrans: pluginName + "-background-trans"
			},
			ev = {
				open: pluginName + "-open",
				close: pluginName + "-close"
			},
			nullHash = "dialog",
			doc = w.document,
			docElem = doc.documentElement,
			body = doc.body,
			$html = $( docElem ),
			$background = $( doc.createElement( 'div' ) ).addClass( cl.bkgd );

		w.Dialog = function( element ){
			this.$el = $( element );

			this.isOpen = false;
			this.positionMedia = this.$el.attr( 'data-set-position-media' );
		};

		w.Dialog.prototype.isSetScrollPosition = function() {
			return !this.positionMedia ||
				( w.matchMedia && w.matchMedia( this.positionMedia ).matches );
		};

		w.Dialog.prototype.open = function( e ) {
			$background[ 0 ].style.height = Math.max( docElem.scrollHeight, docElem.clientHeight ) + "px";
			this.$el.addClass( cl.open );
			$background.addClass( cl.bkgdOpen );

			if( this.isSetScrollPosition() ) {
				this.scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || docElem.scrollTop || ( body && body.scrollY ) || 0 );
				this.$el[ 0 ].style.top = this.scroll + "px";
			} else {
				this.$el[ 0 ].style.top = '';
			}

			$html.addClass( cl.open );
			this.isOpen = true;

			location.hash = nullHash;

			if( doc.activeElement ){
				this.focused = doc.activeElement;
			}
			this.$el[ 0 ].focus();

			this.$el.trigger( cl.opened );
		};

		w.Dialog.prototype.close = function(){
			this.$el.removeClass( cl.open );

			$background.removeClass( cl.bkgdOpen );
			$html.removeClass( cl.open );

			if( this.focused ){
				this.focused.focus();
			}

			if( this.isSetScrollPosition() ) {
				w.scrollTo( 0, this.scroll );
			}

			this.isOpen = false;

			this.$el.trigger( cl.closed );
		};

		return this.each(function(){

			var $el = $( this ),
				positionMedia = $el.attr( 'data-set-position-media' ),
				scroll = 0,
				focused = null,
				isOpen = false,
				dialog = new w.Dialog( this );

			if( !transbg ){
				transbg = $el.is( '[data-transbg]' );
			}

			if( transbg ){
				$background.addClass( cl.bkgdTrans );
			}

			$background.appendTo( body );

			function isSetScrollPosition() {
				return dialog.isSetScrollPosition();
			}

			function open( e ){
				dialog.open( e );
			}

			function close(){
				dialog.close();
			}

			$el
				.addClass( cl.content )
				.attr( "role", "dialog" )
				.attr( "tabindex", 0 )
				.bind( ev.open, open )
				.bind( ev.close, close )
				.bind( "click", function( e ){
					if( $( e.target ).is( "." + cl.close ) ){
						w.history.back();
						e.preventDefault();
					}
				});

			$background.bind( "click", function( e ) {
				w.history.back();
			});

			// close on hashchange if open (supports back button closure)
			$( w ).bind( "hashchange", function( e ){
				var hash = w.location.hash.replace( "#", "" );

				if( hash !== nullHash && dialog.isOpen ){
					$el.trigger( ev.close );
				}
			});

			// open on matching a[href=#id] click
			$( doc ).bind( "click", function( e ){
				var $a = $( e.target ).closest( "a" );

				if( !dialog.isOpen && $a.length && $a.attr( "href" ) ){
					var $matchingDialog = $( $a.attr( "href" ) );
					if( $matchingDialog.length && $matchingDialog.is( $el ) ){
						$matchingDialog.trigger( ev.open );
						e.preventDefault();
					}
				}
			});

			// close on escape key
			$( doc )..bind( "keyup", function( e ){
				if( dialog.isOpen && e.which === 27 ){
					$el.trigger( ev.close );
				}
			});
		});
	};

	// auto-init
	$(function(){
		$( ".dialog" ).dialog();
	});
}( this, jQuery ));
