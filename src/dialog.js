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
		this.hash += this.nohistory ? "-" + Date.now().toString() : "" ;

		this.isOpen = false;
		this.isTransparentBackground = this.$el.is( '[data-transbg]' );

		this._addA11yAttrs();
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
		// unregister the focus stealing
		window.focusRegistry.unregister(this);

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
		this.$el.attr( "role", "dialog" );
		this.$el.attr( "tabindex", "0" );
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
			this._ariaHideUnrelatedElems();

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
			$( this )
				.attr( "data-dialog-aria-hidden", $( this ).attr( "aria-hidden" ) )
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

		if( cleanHash.indexOf( "-dialog" ) > -1 && !this.isLastDialog() ){
			w.location.hash += "#" + this.hash;
		} else if( !this.isLastDialog() ){
			w.location.hash = this.hash;
		}

		if( doc.activeElement ){
			this.focused = doc.activeElement;
		}

		this.$el[ 0 ].focus();
		var self = this;
		setTimeout(function(){
			self._ariaHideUnrelatedElems();
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

		this.$el.trigger( ev.closed );
	};
}( this, window.jQuery ));
