;(function( w, $ ){
	$(function(){
		$( "[data-dialog-open-onload]" ).each(function() {
			var instance = $( this ).data( "dialog-instance" );
			if( instance ) {
				instance.open();
			}
		});
	});
}( this, window.jQuery ));
