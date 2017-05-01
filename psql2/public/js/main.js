$(document).ready(function() {
	$('.edit-announcement').on('click', function(){
		$('#edit_form_timestamp').val($(this).data('timestamp'));
		$('#edit-form-title').val($(this).data('title'));
		$('#edit-form-description').val($(this).data('description'));
	});
});