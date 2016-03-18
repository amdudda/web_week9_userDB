// userlist array for populating info box
var userListData = [];

// get the DOM ready
$(document).ready(function() {

	// populate the table
	populateTable();

	// add event listener to pull up user detail on click
	$('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
	//function(){alert("hi!");} );

});		// end document.ready

// functions called by code

// this fills table with data
function populateTable() {

	// stores contents of table
	var tableContent = "";

	// jQuery calls AJAX for JSON data 
	// this is a callback, so we need to nest population inside callback
	$.getJSON( "/users/userlist",function( data ) {
		// save our data for future use
		userListData = data;	

		// iterate through JSOn data and add row contents
		// **sigh** yes, another callback.
		$.each(data, function(){
			
			tableContent += "<tr>";
			tableContent += "<td><a href='#' class='linkshowuser' rel ='" + this.username + "'>" + this.username + "</a></td>";
			tableContent += "<td>" + this.email + "</td>";
			tableContent += "<td><a href='#' class='linkdeleteuser' rel='" + this._id + "'>delete</a></td>";
			tableContent += "<tr>";
		});		// end iteration through JSON data

		// insert the whole content string into the existing table
		$("#userList table tbody").html(tableContent);
	});		// end JSON callback from AJAX

};		// end populateTable

// this shows user information
function showUserInfo(event) {
	
	// prevent default behavior
	event.preventDefault();

	// retrieve username from link rel attribute
	// caveat: this assumes people's usernames are unique, but is probably a reasonable assumption on most networks
	var thisUserName = $(this).attr('rel');

	// get index of the object based on its id value
	var arrayPosition = userListData.map(function(arrayItem) {
		return arrayItem.username; }).indexOf(thisUserName);

	// get our User object based on the ID we've just gleaned
	var thisUserObject = userListData[arrayPosition];

	// populate our Info box
	$("#userInfoName").text(thisUserObject.fullname);
	$("#userInfoAge").text(thisUserObject.age);
	$("#userInfoGender").text(thisUserObject.gender);
	$("#userInfoLocation").text(thisUserObject.location);

}		// end showUserInfo