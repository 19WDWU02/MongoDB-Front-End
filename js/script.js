let serverURL;
let serverPort;
let url;
let editing = false;

// Get the JSON File
$.ajax({
  url: 'config.json',
  type: 'GET',
  dataType: 'json',
  success:function(keys){
    serverURL = keys['SERVER_URL'];
    serverPort = keys['SERVER_PORT'];
    // create a variable which will be our servers url (it will be easier than having to write out the two variables later on)
    url = `${keys['SERVER_URL']}:${keys['SERVER_PORT']}`;
    // Get all the products
    getProductsData();
  },
  error: function(){
    console.log('cannot find config.json file, cannot run application');
  }
});

// Get all the products
getProductsData = () => {
    // run an ajax request to the route to get all the products
    $.ajax({
        // url: `${serverURL}:${serverPort}/allProducts`,
        url: `${url}/allProducts`,
        type: 'GET',
        dataType: 'json',
        success:function(data){
            // because we run this function multiple times now, we need to empty the product list each time we call it
            $('#productList').empty();
            // Loop over all the items/products which get back from the database
            for (var i = 0; i < data.length; i++) {
                // Create a variable called product which will hold our template string for our product
                let product = `
                    <li
                        class="list-group-item d-flex justify-content-between align-items-center productItem"
                        data-id="${data[i]._id}"
                    >
                        <span class="productName">${data[i].name}</span>`;

                        // We only want to see the edit and remove buttons when a user is logged in.
                        // So we have closed the string above and written an if statement to only add on the buttons
                        // if someone is logged on.
                        if(sessionStorage['userName']){
                            product += `<div>
                                            <button class="btn btn-info editBtn">Edit</button>
                                            <button class="btn btn-danger removeBtn">Remove</button>
                                        </div>`;
                        }
                    // either way we have to close the li so we add the closing li at the end.
                product += `</li>`;

                // Once we have created our product variable with all the data/html, we append it to the productList ul
                $('#productList').append(product);
            }
        },
        error: function(err){
            console.log(err);
            console.log('something went wrong with getting all the products');
        }
    })
}

//Add or Edit a product
$('#addProductButton').click(function(){
    // prevent the default from happening
    event.preventDefault();
    // Get the values for the product name and price
    let productName = $('#productName').val();
    let productPrice = $('#productPrice').val();
    // Check to see if there is a value in the product name
    if(productName.length === 0){
        console.log('please enter a products name');
    } else if(productPrice.length === 0){
        // Check to see if there is a value for the product price
        console.log('please enter a products price');
    } else {
        // only when the there is a product name or price do we want to send some data.

        // We check to see if there if we are editing a product or creating a new one
        // by default editing will be false, but will change to true when we have clicked edit on a product
        if(editing === true){
            // get the id of the product we want to edit
            // this id is saved in a hidden input field
            const id = $('#productID').val();
            // run an ajax request to our edit/patch route
            $.ajax({
                url: `${url}/product/${id}`,
                type: 'PATCH',
                data: {
                    name: productName,
                    price: productPrice
                },
                success:function(result){
                    // if we successfully edit a product

                    // set the productName, productPrice and productID input fields to null
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    $('#productID').val(null);
                    // change the button back to add new product and remove the warning class
                    $('#addProductButton').text('Add New Product').removeClass('btn-warning');
                    // change heading back to add new product
                    $('#heading').text('Add New Product');
                    // now that editing has finsihed, change the editing variable back to false
                    editing = false;
                    // We need to change the value of the single product we just edited.
                    // Get all of the products, all of the li's should have a class of productItem
                    const allProducts = $('.productItem');
                    // Loop over each of those items
                    allProducts.each(function(){
                        // check to see if the data-id value of that li matches the id which we are editing
                        if($(this).data('id') === id){
                            // find the span which holds the name of the product and change it
                            $(this).find('.productName').text(productName);
                            // stop the each function
                            return false;
                        }
                    });
                },
                error: function(err){
                    console.log(err);
                    console.log('something went wront with editing the product');
                }
            })
        } else {
            // This section will only run when we aren't editing, but adding a new product
            // send an ajax request to the create/post route.
            // we need to add in the data which we are wanting to send
            $.ajax({
                url: `${url}/product`,
                type: 'POST',
                data: {
                    name: productName,
                    price: productPrice
                },
                success:function(result){
                    // once we have successfully added a product to the database.
                    // remove the input values from productName and productPrice to null (wipe the input fields)
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    // append a new product to the bottom of the productList
                    $('#productList').append(`
                        <li class="list-group-item d-flex justify-content-between align-items-center productItem" data-id="${result._id}">
                            <span class="productName">${result.name}</span>
                            <div>
                                <button class="btn btn-info editBtn">Edit</button>
                                <button class="btn btn-danger removeBtn">Remove</button>
                            </div>
                        </li>
                    `);
                },
                error: function(error){
                    console.log(error);
                    console.log('something went wrong with sending the data');
                }
            })
        }

    }
})

// Edit button to fill the form with exisiting product
$('#productList').on('click', '.editBtn', function() {
    // prevent the default from happening
    event.preventDefault();
    // Get the ID of the product we want to edit.
    // We have saved the id into data-id to the parent li of the button
    const id = $(this).parent().parent().data('id');
    // send an ajax request to our route for getting single product
    $.ajax({
        url: `${url}/product/${id}`,
        type: 'get',
        dataType: 'json',
        success:function(product){
            // replace the input fields with the name and price from the database
            $('#productName').val(product['name']);
            $('#productPrice').val(product['price']);
            // we have a hidden input field which we need to give it the value of the products id
            $('#productID').val(product['_id']);
            // Change the buttons text to edit and add the warning class
            $('#addProductButton').text('Edit Product').addClass('btn-warning');
            // Change the heading text
            $('#heading').text('Edit Product');
            // set the global variable of editing to true
            editing = true;
        },
        error:function(err){
            console.log(err);
            console.log('something went wrong with getting the single product');
        }
    })
});

// Remove a product
$('#productList').on('click', '.removeBtn', function(){
    // prevent the default from happening
    event.preventDefault();
    // Get the ID of the product we want to edit.
    // We have saved the id into data-id to the parent li of the button
    const id = $(this).parent().parent().data('id');
    // Get the li
    const li = $(this).parent().parent();
    // Run the ajax request to the delete route
    $.ajax({
      url: `${url}/product/${id}`,
      type: 'DELETE',
      success:function(result){
          // success will happen when we have deleted a product from the database
          // remove the li which the button is related to
          li.remove();
      },
      error:function(err) {
        console.log(err);
        console.log('something went wrong deleting the product');
      }
    })
});

// Click on the Login Tab
$('#loginTabBtn').click(function(){
    // prevent the default from happening
    event.preventDefault();
    // Remove the active class from all of the tabs
    $('.nav-link').removeClass('active');
    // Add the active class to the current tab
    $(this).addClass('active');
    // Show/Hide the login and register forms
    $('#loginForm').show();
    $('#registerForm').hide();
});

// Click on the Register Tab
$('#registerTabBtn').click(function(){
    // prevent the default from happening
    event.preventDefault();
    // Remove the active class from all of the tabs
    $('.nav-link').removeClass('active');
    // Add the active class to the current tab
    $(this).addClass('active');
    // Show/Hide the login and register forms
    $('#loginForm').hide();
    $('#registerForm').removeClass('d-none').show();

});

// Register Form
$('#registerForm').submit(function(){
    event.preventDefault();
    // Get all the values from the input fields
    const username = $('#rUsername').val();
    const email = $('#rEmail').val();
    const password = $('#rPassword').val();
    const confirmPassword = $('#rConfirmPassword').val();

    // We are including basic validation
    // Eventually we would need to include a more thorough validation (required, min, max values, emails, uniques, etc)
    // For time sake we are just checking to see if there is a value in each input field
    if(username.length === 0){
        console.log('please enter a username');
    } else if(email.length === 0){
        console.log('please enter an email');
    } else if(password.length === 0){
        console.log('please enter a password');
    } else if(confirmPassword.length === 0){
        console.log('please confirm your password');
    } else if(password !== confirmPassword){
        // We also need to check if the two passwords match
        console.log('your passwords do not match');
    } else {
        // Once all the validation has passed we run our ajax request to our register route
        $.ajax({
            url: `${url}/users`,
            type: 'POST',
            data: {
                username: username,
                email: email,
                password: password
            },
            success:function(result){
                // We are logging the result of the register form.
                // We could either log the user in automatically, or switch to the login tab
                console.log(result);
            },
            error:function(err){
                console.log(err);
                console.log('Something went wrong with registering a new user');
            }
        })
    }
});

// Login Form
$('#loginForm').submit(function(){
    event.preventDefault();
    // Get the two input fields
    const username = $('#lUsername').val();
    const password = $('#lPassword').val();

    // Add in the simple validation to make sure people input a value
    if(username.length === 0){
        console.log('please enter a username');
    } else if(password.length === 0){
        console.log('please enter a password');
    } else {
        // Send an ajax request to our login route.
        // Even though we are getting back a user, beacuse we are dealing with secure data (password), we want to use a POST request
        $.ajax({
            url: `${url}/getUser`,
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success:function(result){
                // the result value is whatever gets sent back from the server.
                if(result === 'invalid user'){
                    // If someone tries to login with a username that doesnt exist
                    console.log('cannot find user with that username');
                } else if(result === 'invalid password'){
                    // If someone logs in with a valid username but the password is wrong
                    console.log('Your password is wrong');
                } else {
                    // If someone logs in with a valid username and a valid password
                    console.log('lets log you in');
                    console.log(result);

                    // sessionStorage (and LocalStorage) allows you to save data into your web browser and will stay there until they get removed
                    // sessionStorage will keep data until the session is finsihed (closing the tab or browser)
                    // localStorage will keep the data forever until someone manually clears the localStorage cache.
                    // This is how we will be creating our login system
                    // If we save a value into sessionStorage or localStorage, if we keep refreshing our page, the value we saved will still be there.
                    // In our document.ready() function bellow we are checking to see if there is a value in our sessionStorage called user_Name
                    sessionStorage.setItem('userID', result['_id']);
                    sessionStorage.setItem('userName', result['username']);
                    sessionStorage.setItem('userEmail', result['email']);
                    // Reload all the products
                    getProductsData();
                    // Hide and show the relevant content
                    $('#authForm').modal('hide');
                    $('#loginBtn').hide();
                    $('#logoutBtn').removeClass('d-none');
                    $('#addProductSection').removeClass('d-none');
                }
            },
            error:function(err){
                console.log(err);
                console.log('Something went wrong with logging in.');
            }
        })
    }
});

//Logout Button
$('#logoutBtn').click(function(){
    // Clear the session storage to remove the user
    sessionStorage.clear();
    // Reload all the products
    getProductsData();
    // Hide and show the relevant content
    $('#loginBtn').show();
    $('#logoutBtn').addClass('d-none');
    $('#addProductSection').addClass('d-none');
});

//We are using this so that our modal appears on load
//We will turn this off when we are ready
$(document).ready(function(){
    // This allows the modal to pop up on load (we will remove this line when we are done with the login / register functionality)
    // $('#authForm').modal('show');

    // Check to see if there is a value called user_Name in the sessionStorage, this will only be there when we login in successfully
    if(sessionStorage['userName']){
        // you have logged in
        console.log('you are logged in ');
        $('#loginBtn').hide();
        $('#logoutBtn').removeClass('d-none');
        $('#addProductSection').removeClass('d-none');

    } else {
        // you aren't logged in
        console.log('please sign in');
    }

    // If you check sessionStorage when there isnt anything in there it should be an empty array
    // If you check it when there is some values, it will be an object
    console.log(sessionStorage);

    // From here we are going to be using a lot of if statements to hide and show specifc elements.
    // If there is a value for user_Name, then we will see the logout button, but if there isn't then we will see the login/Register button.
    // to clear out sessionStorage we need to call. sessionStorage.clear() which will clear all the items in our session storage.
    // This will happen on a click function for our logout button
})
