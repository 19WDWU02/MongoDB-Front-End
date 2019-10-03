let serverURL;
let serverPort;
let url;
let editing = false;

$(document).ready(function(){
    if(sessionStorage['userName']){
        $('#loginBtn').hide();
        $('#logoutBtn').removeClass('d-none');
        $('#addProductSection').removeClass('d-none');

    }
})

// Get the JSON File
$.ajax({
  url: 'config.json',
  type: 'GET',
  dataType: 'json',
  success:function(keys){
    serverURL = keys['SERVER_URL'];
    serverPort = keys['SERVER_PORT'];
    url = `${keys['SERVER_URL']}:${keys['SERVER_PORT']}`;
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
            if (data.length > 0) {
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
                            console.log(data[i]);
                            console.log(sessionStorage);
                            if (data[i].user_id == sessionStorage.userId) {
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
            } else {
                $('#productList').html('<p>No products found</p>');
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
    event.preventDefault();
    const productName = $('#productName');
    const productPrice = $('#productPrice');
    const productValid = validation(productName);
    const priceValid = validation(productPrice);

    if(productValid === true && priceValid === true){
        productName.parent().find('.invalid-feedback').remove();
        productName.removeClass('is-valid is-invalid');
        productPrice.parent().find('.invalid-feedback').remove();
        productPrice.removeClass('is-valid is-invalid');
        if(editing === true){
            const id = $('#productID').val();
            console.log(id);
            $.ajax({
                url: `${url}/product/${id}`,
                type: 'PATCH',
                data: {
                    name: productName.val(),
                    price: productPrice.val()
                },
                success:function(result){
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    $('#productID').val(null);
                    $('#addProductButton').text('Add New Product').removeClass('btn-warning');
                    $('#heading').text('Add New Product');
                    editing = false;
                    const allProducts = $('.productItem');
                    allProducts.each(function(){
                        if($(this).data('id') === id){
                            $(this).find('.productName').text(productName);
                        }
                    });
                },
                error: function(err){
                    console.log(err);
                    console.log('something went wront with editing the product');
                }
            })
        } else {
            $.ajax({
                url: `${url}/product`,
                type: 'POST',
                data: {
                    name: productName.val(),
                    price: productPrice.val(),
                    userId: sessionStorage.userId
                },
                success:function(result){
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    if ($('#productList').html() == '<p>No products found</p>') {
                        $('#productList').html(null);
                    }
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
    event.preventDefault();
    const id = $(this).parent().parent().data('id');
    $.ajax({
        url: `${url}/product/${id}`,
        type: 'get',
        dataType: 'json',
        success:function(product){
            $('#productName').val(product['name']);
            $('#productPrice').val(product['price']);
            $('#productID').val(product['_id']);
            $('#addProductButton').text('Edit Product').addClass('btn-warning');
            $('#heading').text('Edit Product');
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
    event.preventDefault();
    const id = $(this).parent().parent().data('id');
    const li = $(this).parent().parent();
    $.ajax({
      url: `${url}/product/${id}`,
      type: 'DELETE',
      success:function(result){
        li.remove();
      },
      error:function(err) {
        console.log(err);
        console.log('something went wrong deleting the product');
      }
    })
});

$('#loginTabBtn').click(function(){
    event.preventDefault();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    $('#loginForm').show();
    $('#registerForm').hide();
});

$('#registerTabBtn').click(function(){
    event.preventDefault();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    $('#loginForm').hide();
    $('#registerForm').removeClass('d-none').show();

});

// Register Form
$('#registerForm').submit(function(){
    event.preventDefault();
    // Get all the values from the input fields
    const username = $('#rUsername');
    const email = $('#rEmail');
    const password = $('#rPassword');
    const confirmPassword = $('#rConfirmPassword');

    const usernameValid = validation(username);
    const emailValid = validation(email);
    const passwordValid = validation(password);
    const confirmPasswordValid = validation(confirmPassword);

    if(usernameValid === true && emailValid === true && passwordValid === true && confirmPasswordValid === true){
        $.ajax({
            url: `${url}/users`,
            type: 'POST',
            data: {
                username: username.val(),
                email: email.val(),
                password: password.val()
            },
            success:function(result){
                sessionStorage.setItem('userId', result['_id']);
                sessionStorage.setItem('userName', result['username']);
                sessionStorage.setItem('userEmail', result['email']);
                getProductsData();
                // Hide and show the relevant content
                $('#authForm').modal('hide');
                $('#loginBtn').hide();
                $('#logoutBtn').removeClass('d-none');
                $('#addProductSection').removeClass('d-none');
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
    const username = $('#lUsername');
    const password = $('#lPassword');

    const usernameValid = validation(username);
    const passwordValid = validation(password);

    if(usernameValid === true && passwordValid === true){
        $.ajax({
            url: `${url}/getUser`,
            type: 'POST',
            data: {
                username: username.val(),
                password: password.val()
            },
            success:function(result){
                // the result value is whatever gets sent back from the server.
                if(result === 'invalid user'){
                    // If someone tries to login with a username that doesnt exist
                    $('#lUsername').addClass('is-invalid').parent().append(`<div class="invalid-feedback">Cannot find a user with user with these credentials.</div>`);
                    $('#lPassword').addClass('is-invalid').parent().append(`<div class="invalid-feedback">Cannot find a user with user with these credentials.</div>`);
                } else if(result === 'invalid password'){
                    // If someone logs in with a valid username but the password is wrong
                    $('#lPassword').addClass('is-invalid').parent().append(`<div class="invalid-feedback">Incorrect Password.</div>`);
                } else {
                    // If someone logs in with a valid username and a valid password

                    // sessionStorage (and LocalStorage) allows you to save data into your web browser and will stay there until they get removed
                    // sessionStorage will keep data until the session is finsihed (closing the tab or browser)
                    // localStorage will keep the data forever until someone manually clears the localStorage cache.
                    // This is how we will be creating our login system
                    // If we save a value into sessionStorage or localStorage, if we keep refreshing our page, the value we saved will still be there.
                    // In our document.ready() function bellow we are checking to see if there is a value in our sessionStorage called user_Name
                    sessionStorage.setItem('userId', result['_id']);
                    sessionStorage.setItem('userName', result['username']);
                    sessionStorage.setItem('userEmail', result['email']);
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
    sessionStorage.clear();
    getProductsData();
    $('#loginBtn').show();
    $('#logoutBtn').addClass('d-none');
    $('#addProductSection').addClass('d-none');
});


$('.validationField').blur(function(){
    const input = $(this);
    validation(input);
});

validation = (input) => {
    input.parent().find('.invalid-feedback').remove();
    input.removeClass('is-valid is-invalid');

    let validationRules = input.data('validation');
    const value = input.val();
    const camelName = input.attr('name');
    const splitName = camelName.replace( /([A-Z])/g, " $1" );
    const name = splitName.charAt(0).toUpperCase() + splitName.slice(1);

    let rules;
    if(validationRules.includes(',')){
        rules = validationRules.split(',');
    } else {
        rules = [validationRules];
    }

    let result = true;
    for (var i = 0; i < rules.length; i++) {
        let rule = rules[i];
        if(rule.includes(':')){
            const x = rule.split(':');
            rule = x[0];
            ruleVal = x[1];
        };
        switch(rule){
            case 'required':
                if(value.length === 0){
                    result = `${name} is required. please enter a value`;
                }
            break;
            case 'min':
                if(value.length < parseInt(ruleVal)){
                    result = `${name} must be at least than ${ruleVal} long`;
                }
            break;
            case 'min':
                if(value.length > parseInt(ruleVal)){
                    result = `${name} must be at less than ${ruleVal} long`;
                }
            break;
            case 'numeric':
                if(!parseInt(value)){
                    result = `${name} must be a number`;
                }
            break;
            case 'email':
                // this is a regular expression for an email address
                 const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                 if(!re.test(value)){
                     result = `Please enter a valid email address`;
                 }
            break
            case 'match':
                if(value !== $('#'+ruleVal).val()){
                    result = `${name} does not match ${$('#'+ruleVal).attr('name')}`;
                    $('#'+ruleVal).parent().find('.invalid-feedback').remove();
                    $('#'+ruleVal).addClass('is-invalid').removeClass('is-valid');
                } else {
                    $('#'+ruleVal).parent().find('.invalid-feedback').remove();
                    $('#'+ruleVal).removeClass('is-invalid').addClass('is-valid');
                }
            break;
        }
        if(result !== true){
            break;
        } else {
            continue;
        }
    }

    if(result !== true){
        input.addClass('is-invalid');
        input.parent().append(`<div class="invalid-feedback">${result}</div>`)
    } else {
        input.addClass('is-valid');
    }

    return result;
}
