// userlist array for populating info box
var userListData = [];

// get the DOM ready
$(document).ready(function() {

	// populate the table
	populateTable();

	// add event listener to pull up user detail on click
	$('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

	// add event listener for 'add user' button click
	$("#btnAddUser").on("click",addUser);

	// event listener to cancel editing
	$("#btnCancelEdit").on("click",cancelEdit);

	// event listener to submit edit
	$("#btnEditUser").on("click",sendEdit);

	// event listener for 'delete user' link click
	$("#userList table tbody").on("click","td a.linkdeleteuser", deleteUser);

	// event listener for 'edit user' link click
	$("#userList table tbody").on("click","td a.linkEditUser", editUser);

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
			tableContent += "<td><a href='#' class='linkEditUser' rel='" + this._id + "'>edit</a></td>";
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


// and here's the function to add a new user
function addUser(event) {

	// prevent it from doing ordinary form submission
	event.preventDefault();

	// very simple validation, just checks for empty fields
	// iterates through all the inputs in the #addUser container
	// and increments errorCount each time an empty field is encountered
	var errorCount = 0;
	$("#addUser input").each(function(index,val) {
		if ( $(this).val() === "" ) { errorCount++ }
	});

	// if errorCount is zero, then we can proceed with insert
	if ( errorCount === 0 ) {
		// collect data for new user into a JSON string
		var newUser = {
			"username": $("#addUser fieldset input#inputUserName").val(),
			"email": $("#addUser fieldset input#inputUserEmail").val(),
			"fullname": $("#addUser fieldset input#inputUserFullName").val(),
			"age": $("#addUser fieldset input#inputUserAge").val(),
			"location": $("#addUser fieldset input#inputUserLocation").val(),
			"gender": $("#addUser fieldset input#inputUserGender").val()
		}

		// use AJAX to POST object to adduser service
		$.ajax({
			type: 'POST',
			data: newUser,
			url: '/users/adduser',
			dataType: 'JSON'
		}).done(function( response ) {
			// debugging: console.log("trying to post");
			// check for success (i.e. empty string) response
			if (response.msg === "") {
				
				// clear form fields
				$("#addUser fieldset input").val("");

				// update table
				populateTable();
			}
			else {
				// something went wrong, alert the user
				alert("Error: " + response.msg);
			}
		});		// end AJAX call

	}	// end if errorCount === 0
	else {  
		// errorCount is nonzero - tell user to fill in all form fields
		alert("Please fill in all fields.");
		return false;
	}	// end if-else for errorCount

};  // end addUser

// delete user
function deleteUser(event) {

	event.preventDefault();

	// popup a confirmation dialog
	var confirmation = confirm("Are you sure you want to delete this user?");

	if (confirmation === true) {
		// if they say yes, delete the user
		$.ajax({
			type: "DELETE",
			url: "/users/deleteuser/" + $(this).attr("rel")
		}).done( function(response) {
			if (response.msg === "" ) {
				// do nothing
			}
			else {
				// alert the user 
				//don't need to prefix with "error:" because that's already in the message.
				alert(response.msg);
			}

			// update the table
			populateTable();
		});
	}
	else {
		// do nothing
		return false;
	}	// end if-else handler for confirmation

};


// function to enable edit user
function editUser(event) {
	event.preventDefault();
	// toggle visibility of add and edit buttons
	$("#btnAddUser").attr("style","display:none");
	$("#btnEditUser").attr("style","display:visible");
	$("#btnCancelEdit").attr("style","display:visible");	

	// Change header 
	$("#addOrEdit").text("Edit User");

	// fetch user data and populate fields - copypasta from showUserInfo

	// retrieve _id from link rel attribute
	var thisUserName = $(this).attr('rel');
	
	// get index of the object based on its id value
	var arrayPosition = userListData.map(function(arrayItem) {
		return arrayItem._id; }).indexOf(thisUserName);
	
	// get our User object based on the ID we've just gleaned
	var thisUserObject = userListData[arrayPosition];

	// populate form fields
	$("#inputUserName").val(thisUserObject.username);
	$("#inputUserEmail").val(thisUserObject.email);
	$("#inputUserFullName").val(thisUserObject.fullname);
	$("#inputUserAge").val(thisUserObject.age);
	$("#inputUserLocation").val(thisUserObject.location);
	$("#inputUserGender").val(thisUserObject.gender);
	$("#inputUserID").val(thisUserObject._id);
}

// resets form after Edit clicked
function cancelEdit(event) {
	event.preventDefault();

	resetForm();
}

// resets edit buttons and form fields
function resetForm() {
	// toggle visibility of add and edit buttons
	$("#btnAddUser").attr("style","display:visible");
	$("#btnEditUser").attr("style","display:none");
	$("#btnCancelEdit").attr("style","display:none");

	// then clear fields
	$("#addUser fieldset input").val("");
	
	// Change header 
	$("#addOrEdit").text("Add User");
}

// sends update to database
function sendEdit(event) {
	event.preventDefault();
	
	// gather data and submit it to edit handler
	// repurposes the add user code extensively
	var idToEdit = $("#addUser fieldset input#inputUserID").val();

	// very simple validation, just checks for empty fields
	// iterates through all the inputs in the #addUser container
	// and increments errorCount each time an empty field is encountered
	var errorCount = 0;
	$("#addUser input").each(function(index,val) {
		if ( $(this).val() === "" ) { errorCount++ }
	});

	// if errorCount is zero, then we can proceed with update
	if ( errorCount === 0 ) {
		// collect data for edited user into a JSON string
		// TODO: this is clunky and just updates everything even if there are no changes; perhaps future version might only submit non-empty fields?
		var editedUser = {
			"username": $("#addUser fieldset input#inputUserName").val(),
			"email": $("#addUser fieldset input#inputUserEmail").val(),
			"fullname": $("#addUser fieldset input#inputUserFullName").val(),
			"age": $("#addUser fieldset input#inputUserAge").val(),
			"location": $("#addUser fieldset input#inputUserLocation").val(),
			"gender": $("#addUser fieldset input#inputUserGender").val()
		}

		// use AJAX to POST object to adduser service
		$.ajax({
			type: 'PUT',
			data: editedUser,
			url: '/users/edituser/' + idToEdit,
			dataType: 'JSON'
		}).done(function( response ) {
			console.log("trying to post");
			// check for success (i.e. empty string) response
			if (response.msg === "") {
				
				// reset form
				resetForm();

				// update table
				populateTable();
			}
			else {
				// something went wrong, alert the user
				alert("Error: " + response.msg);
			}
		});		// end AJAX call

	}	// end if errorCount === 0
	else {  
		// errorCount is nonzero - tell user to fill in all form fields
		alert("Please fill in all fields.");
		return false;
	}	// end if-else for errorCount

}