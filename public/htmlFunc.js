$(document).ready(function () {
	document.oncontextmenu = function(e){
    e.preventDefault();
  };
});

function openForm() {
  $("#modal").css('display', 'block');
}

function closeForm() {
  $("#modal").css('display', 'none');
}