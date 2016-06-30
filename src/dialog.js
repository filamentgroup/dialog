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
		// this is because pairing the ID directly makes the browser jump to the top of the dialog,
		// rather than allowing us to space it off the top of the viewport.
		// also, if the dialog has a data-nohistory attr, this property will prevent its findability for onload and hashchanges
		this.nohistory = this.$el.is( '[data-dialog-nohistory]' );
		this.hash = this.$el.attr( "id" ) + "-dialog";

		this.isOpen = false;
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
