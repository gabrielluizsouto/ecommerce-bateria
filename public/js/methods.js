function loadFile(fileName){
    var fileUrl = "";
    var response;
    var xhr = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
    
    //pages that can be loaded
    if(fileName.indexOf('menu.html') == 0){
        var fileUrl = '/public/assets/menu.html';
    }

    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4 && xhr.status == 200) {    //readystate === 4 (done) 
            response = xhr.responseText;
        }
    };
    xhr.open('GET', fileUrl, false);
    xhr.send();

    return response;
}

function loadMenuTopo(){
    var menu = loadFile('menu.html');
    var divMenuTopo = document.querySelector('.menu-topo');
    menu = menu.replace(/(\r\n|\n|\r|\t)/gm, "");  //remove break lines and tabs
    divMenuTopo.insertAdjacentHTML('afterbegin', menu); 
}

function createLoginUserToken(responseWithToken){
    try {
        var textToken = JSON.parse(responseWithToken); 
        var token = textToken['token'];
    
        var now = new Date();
        var time = now.getTime();

        time += 3600 * 1000;    //1 hour
        now.setTime(time);
        window.document.cookie = 
            'jwtoken=' + token + 
            '; expires=' + now.toUTCString() + 
            '; path=/';
    }
    catch {
        console.log("Error creating token cookie");
    }
}

function getTokenCookieValue(){
    var c_name = 'jwtoken'; //cookie name
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return undefined;
}

function userLogout(){
    document.cookie = "jwtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

function sendLoginForm(){
    const userEmail = document.querySelector('#form-login-email').value;
    const userPassword = document.querySelector('#form-login-password').value;
    const loginParams = {
        email: userEmail,
        password: userPassword
    }
    var responseWithToken = "";

    var xhr = new window.XMLHttpRequest();
    xhr.open('POST', '/api/users/login', false);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {    //readystate === 4 (done)
            responseWithToken = xhr.responseText;

            createLoginUserToken(responseWithToken);
            alert("You will be logged by the next 1 hour");
        }
    };
    xhr.send(JSON.stringify(loginParams));
    location.reload();
}

function sendSignupForm(){
    const userEmail = document.querySelector('#form-signup-email').value;
    const userPassword = document.querySelector('#form-signup-password').value;
    const signUpParams = {
        email: userEmail,
        password: userPassword
    }

    var xhr = new window.XMLHttpRequest();
    xhr.open('POST', '/api/users/signup', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(signUpParams));

    alert("Successfull signup");
}


function generateTableHead(table, data) {
    var thead = document.createElement('tr');//let thead = table.createTHead();
    table.appendChild(thead);//let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      thead.appendChild(th);
    }
  }
  
  function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
      }
    }
  }

function getOrders(){
    var response;
    var tokenCookieValue = getTokenCookieValue();

    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', '/api/orders', false);
    //xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + tokenCookieValue);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {    //readystate === 4 (done)
            response = xhr.responseText;
        } 
        else if(xhr.readyState === 4 && xhr.status === 401) {    //readystate === 4 (done){
            alert("Login to access all orders");
        } 
    };
    xhr.send();

    return response;
}


function getProducts(){
    var allProductsData = {};
    
    getXmlDoc('/api/products', function(responseText){
        allProductsData = responseText;
    });
    
    return allProductsData;
}

function createProductsPage(data){
    function createProductDiv(prod){
        let productDiv = document.createElement('div');
        let prodClassAttribute = document.createAttribute('class');
        prodClassAttribute.value = "product-div";
        productDiv.setAttributeNode(prodClassAttribute);
//debugger;
        Object.keys(prod).forEach((item)=>{
            let thisDiv = document.createElement('div');
            //show image
            if(item.indexOf("productImage") >= 0){
                try{
                    let image = new Image();
                    image.src = '/' + prod.productImage;
                    image.height = 100;
                    image.width = 100;
                    
                    thisDiv.appendChild(image);
                } catch {
                    err => {console.log(err)}
                };
            }

            //show name
            if(item.indexOf("name") >= 0){
                try{
                    let divName = document.createElement('div');
                    thisDiv.innerHTML = prod.name;
                    thisDiv.appendChild(divName)
                } catch {
                    err => {console.log(err)}
                };
            }

            //show price
            if(item.indexOf("price") >= 0){
                try{
                    let divPrice= document.createElement('div');
                    thisDiv.innerHTML = prod.price;
                    thisDiv.appendChild(divPrice)
                } catch {
                    err => {console.log(err)}
                };
            }

            //setting class name
            let classAttribute = document.createAttribute('class');
            classAttribute.value = item;
            thisDiv.setAttributeNode(classAttribute);
            
            //adding node to page
            productDiv.appendChild(thisDiv);
        });
        return productDiv;
    }

    var products = JSON.parse(data)["products"];

    var productsDiv = document.querySelector('.all-products-table');
    
    products.forEach(element => {
        let node = createProductDiv(element);
        productsDiv.appendChild(node);
    });
}

function getXmlDoc(myurl, cb){
    var xhr = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));

    xhr.open('GET', myurl, false); ; 
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4 && xhr.status == 200) {    //readystate === 4 (done) 
            if(typeof cb === 'function') cb(xhr.responseText);
        }
    };
    xhr.send();
}