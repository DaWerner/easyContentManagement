function updatePW(){
    let pw1=$("#newPWFirst").val();
    let pw2=$("#newPWSecond").val();
    if(pw1!==pw2){
        $("#newPWFirst").val("");
        $("#newPWSecond").val("");
        alert("Passwords did not match!");
        return;
    }
    var hasher = new Hashes.SHA256;
    var PW = hasher.hex(pw1);

    
    $.ajax({url: "http://" + window.location.hostname + ":5000/user/changeownpw",
        data: {token: getCookie("AuthToken"),
               newPW: PW
        },
        type: "POST",
        success: function (data) {
            data = updateToken(data);
            $("#setPWModal").modal("hide")
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("Something went wrong");
        }

    });
    
}


function logout() {
    $.ajax({url: "http://"+ window.location.hostname + ":5000/user/logout",
        data: {token: getCookie("AuthToken")},
        type: "GET",
        success: function (data) {
            window.location = "./index.html";
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
        }

    });


}


function identUser(){
        $.ajax({url: "http://" + window.location.hostname + ":5000/user/getown",
        data: {token: getCookie("AuthToken")
        },
        type: "GET",
        success: function (data) {
            activeUser = JSON.parse(data);
            $("#activeUser").text(activeUser.username);
            $("#ownRole").text(activeUser.role);
            if(activeUser.permissions.admin){
                $("#profileActions").append("<a class='mdl-menu__item' href='./adminpanel.html'>Go to Adminpanel</a>")
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("The passed Credential don't match a known account");
        }

    });

}