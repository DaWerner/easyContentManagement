function login(){
        var hasher = new Hashes.SHA256;
        var User = $("#user").val();
        console.log($("#pwLog").val())
        var PW = hasher.hex($("#pwLog").val());
	$.ajax({url: "http://"+ window.location.hostname + ":5000/user/login",
            data: {user: User, pw: PW},
            type: "POST",
            success: function(data){
                        console.log(data);
                        if(data !== -1){
                            window.location = "./editor.html";
                            document.cookie = "AuthToken=" + data;
                        }
                    },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert("The passed Credential don't match a known account");
            } 

            });
}



function logout(){
    var MyCookie = getCookie("AuthToken");
    	$.ajax({url: "http://"+ window.location.hostname + ":5000/user/logout",
            data: {token: MyCookie},
            type: "POST",
            success: function(data){
                        console.log(data);
                        if(data !== -1){
                            window.location = "./index.html";
                            document.cookie = "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                        }
                    },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert("The passed Credential don't match a known account");
            } 

            });
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}