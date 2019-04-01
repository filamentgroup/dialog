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

		// keeping data-nobg here for compat. Deprecated.
		this.$background = !this.$el.is( '[data-' + pluginName + '-nobg]' ) ?
			$( doc.createElement('div') ).addClass( cl.bkgd ).attr( "tabindex", "-1" ).appendTo( "body") :
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
		this.hash += this.nohistory ? "-" + new Date().getTime().toString() : "" ;

		this.isOpen = false;
		this.isTransparentBackground = this.$el.is( '[data-transbg]' );

		this._addA11yAttrs();
	};

  // default to tracking history with the dialog
  Dialog.history = true;

	// This property is global across dialogs - it determines whether the hash is get/set at all
	Dialog.useHash = true;

	Dialog.events = ev = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		close: pluginName + "-close",
		closed: pluginName + "-closed",
		resize: pluginName + "-resize"
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
		// unregister the focus stealing
		window.focusRegistry.unregister(this);

		this.$el.trigger("destroy");

		// clear init for this dom element
		this.$el.data()[pluginName] = undefined;

		// remove the backdrop for the dialog
		this.$background.remove();
	};

	Dialog.prototype.checkFocus = function(event){
		var $target = $( event.target );
		var shouldSteal;

		shouldSteal =
			this.isOpen &&
			!$target.closest( this.$el[0]).length &&
			this.isLastDialog() &&
			!this._isNonInteractive();

		return shouldSteal;
	};

	Dialog.prototype.stealFocus = function(){
		this.$el[0].focus();
	};



	Dialog.prototype._addA11yAttrs = function(){
		this.$el
			.attr( "role", "dialog" )
			.attr( "tabindex", "-1" )
			.find( Dialog.selectors.close ).attr( "role", "button" );

	};

	Dialog.prototype._removeA11yAttrs = function(){
		this.$el.removeAttr( "role" );
		this.$el.removeAttr( "tabindex" );
	};

	Dialog.prototype._isNonInteractive = function(){
		var computedDialog = window.getComputedStyle( this.$el[ 0 ], null );
		var closeLink = this.$el.find( Dialog.selectors.close )[0];
		var computedCloseLink;
		if( closeLink ){
			computedCloseLink = window.getComputedStyle( closeLink, null );
		}
		var computedBackground = window.getComputedStyle( this.$background[ 0 ], null );
		return computedDialog.getPropertyValue( "display" ) !== "none" &&
			computedDialog.getPropertyValue( "visibility" ) !== "hidden" &&
			( !computedCloseLink || computedCloseLink.getPropertyValue( "display" ) === "none" ) &&
			computedBackground.getPropertyValue( "display" ) === "none";
	};

	Dialog.prototype._checkInteractivity = function(){
		if( this._isNonInteractive() ){
			this._removeA11yAttrs();
			this._ariaShowUnrelatedElems();
		}
		else{
			this._addA11yAttrs();

		}
	};


	Dialog.prototype._ariaHideUnrelatedElems = function(){
		this._ariaShowUnrelatedElems();
		var ignoredElems = "script, style";
		var hideList = this.$el.siblings().not( ignoredElems );
		this.$el.parents().not( "body, html" ).each(function(){
			hideList = hideList.add( $( this ).siblings().not( ignoredElems ) );
		});
		hideList.each(function(){
			var priorHidden = $( this ).attr( "aria-hidden" ) || "";
			$( this )
				.attr( "data-dialog-aria-hidden", priorHidden )
				.attr( "aria-hidden", "true" );
		});
	};


	Dialog.prototype._ariaShowUnrelatedElems = function(){
		$( "[data-dialog-aria-hidden]" ).each(function(){
			if( $( this ).attr( "data-dialog-aria-hidden" ).match( "true|false" ) ){
				$( this ).attr( "aria-hidden", $( this ).attr( "data-dialog-aria-hidden" ) );
			}
			else {
				$( this ).removeAttr( "aria-hidden" );
			}
		}).removeAttr( "data-dialog-aria-hidden" );
	};

	Dialog.prototype.resizeBackground = function() {
		if( this.$background.length ) {
			var scrollPlusHeight = (this.scroll || 0) + this.$el[0].clientHeight;
			this.$background[ 0 ].style.height = Math.max( scrollPlusHeight, docElem.scrollHeight, docElem.clientHeight ) + "px";
		}
	};

	Dialog.prototype.open = function() {
		if( this.isOpen ){
			return;
		}

		this.$el.addClass( cl.open );

		this.$background.addClass( cl.bkgdOpen );
		this.$background.attr( "id", this.$el.attr( "id" ) + "-background" );
		this._setBackgroundTransparency();

		this.scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || docElem.scrollTop || ( body && body.scrollY ) || 0 );
		this.$el[ 0 ].style.top = this.scroll + "px";
		this.resizeBackground();

		$html.addClass( cl.open );
		this.isOpen = true;

		var cleanHash = w.location.hash.replace( /^#/, "" );

		if( w.Dialog.useHash ){
			if( cleanHash.indexOf( "-dialog" ) > -1 && !this.isLastDialog() ){
				w.location.hash += "#" + this.hash;
			} else if( !this.isLastDialog() ){
				w.location.hash = this.hash;
			}
		}

		if( doc.activeElement ){
			this.focused = doc.activeElement;
		}

		this.$el[ 0 ].focus();
		var self = this;
		setTimeout(function(){
			self._ariaHideUnrelatedElems();
		});

		var self = this;
		this.$el.on( ev.resize, function() {
			self.resizeBackground();
		});

		this.$el.trigger( ev.opened );
	};

	Dialog.prototype.lastHash = function(){
		return w.location.hash.split( "#" ).pop();
	};

	// is this the newest/last dialog that was opened based on the hash
	Dialog.prototype.isLastDialog = function(){
		return this.lastHash() === this.hash;
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

		this._ariaShowUnrelatedElems();

		// if close() is called directly and the hash for this dialog is at the end
		// of the url, then we need to change the hash to remove it, either by going
		// back if we can, or by adding a history state that doesn't have it at the
		// end
		if( window.location.hash.split( "#" ).pop() === this.hash ){
			// check if we're back at the original hash, if we are then we can't
			// go back again otherwise we'll move away from the page
			var hashKeys = window.location.hash.split( "#" );
			var initialHashKeys = this.initialLocationHash.split( "#" );

			// if we are not at the original hash then use history
			// otherwise, if it's the same starting hash as it was at init time, we
			// can't trigger back to close the dialog, as it might take us elsewhere.
			// so we have to go forward and create a new hash that does not have this
			// dialog's hash at the end
			if( window.Dialog.useHash ){
				if( hashKeys.join("") !== initialHashKeys.join("") ){
					window.history.back();
				} else {
					var escapedRegexpHash = this
							.hash
							.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");

					window.location.hash = window
						.location
						.hash
						.replace( new RegExp( "#" + escapedRegexpHash + "$" ), "" );
				}
			}

			return;
		}

		this.$el.removeClass( cl.open );

		this.$background.removeClass( cl.bkgdOpen );

		this.isOpen = false;

		// we only want to throw focus on close if we aren't
		// opening a nested dialog or some other UI state
		if( this.focused && !this.isLastDialog()){
				this.focused.focus();
		}
		if( $( "." + pluginName + "." + cl.open ).length === 0 ){
			$html.removeClass( cl.open );
			w.scrollTo( 0, this.scroll );
		}

		this.$el.off( ev.resize );

		this.$el.trigger( ev.closed );
	};
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
			var onOpen, onClose, onClick, onBackgroundClick;

			$el.addClass( Dialog.classes.content )

				.bind( Dialog.events.open, onOpen = function(){
					dialog.open();
				})
				.bind( Dialog.events.close, onClose = function(){
					dialog.close();
				})
				.bind( "click", onClick = function( e ){
					if( $(e.target).closest(Dialog.selectors.close).length ){
						e.preventDefault();
						dialog.close();
					}
				});

			dialog.$background.bind( "click", onBackgroundClick = function() {
				dialog.close();
			});

			var onHashchange;

			// on load and hashchange, open the dialog if its hash matches the last part of the hash, and close if it doesn't
			if( Dialog.useHash ){
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
			}

			var onDocClick, onKeyup, onResize;

			// open on matching a[href=#id] click
			$( doc ).bind( "click", onDocClick = function( e ){
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
						//			the error name "SynatxError" is supported
						return;
					}

					if( $matchingDialog.length && $matchingDialog.is( $el ) ){
						e.preventDefault();
						$matchingDialog.trigger( Dialog.events.open );
					}
				}
			});

			// close on escape key
			$( doc ).bind( "keyup", onKeyup = function( e ){
				if( e.which === 27 ){
					dialog.close();
				}
			});

			dialog._checkInteractivity();
			var resizepoll;
			$( window ).bind( "resize", onResize = function(){
				if( resizepoll ){
					clearTimeout( resizepoll );
				}
				resizepoll = setTimeout( function(){
					dialog._checkInteractivity.call( dialog );
				}, 150 );
			});

			$el.bind("destroy", function(){
				$(w).unbind("hashchange", onHashchange);

				$el
					.unbind( Dialog.events.open, onOpen )
					.unbind( Dialog.events.close, onClose )
					.unbind( "click", onClick );

				dialog.$background.unbind( "click", onBackgroundClick);

				$( doc ).unbind( "click", onDocClick );
				$( doc ).unbind( "keyup", onKeyup );
				$( window ).unbind( "resize", onResize );
			});

			onHashchange();

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

		$(window.document).bind("focusin.focus-registry", function(event){
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
		var newRegistry = [];

		for(var i = 0; i < this.registry.length; i++ ){
			if(this.registry[i] !== obj){
				newRegistry.push(this.registry[i]);
			}
		}

		this.registry = newRegistry;
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
