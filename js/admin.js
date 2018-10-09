function register(){
        var hasher = new Hashes.SHA256;
        var Name = $("#name").val();
        var Mail = $("#mail").val();
        var Role = $("#role").val();
        console.log($("#pwReg").val())
        var PW = hasher.hex($("#pwReg").val());
	$.ajax({url: "http://"+ window.location.hostname + ":5000/user/register",
            data: {email: Mail, pw: PW, name: Name, role: Role},
            type: "POST",
            success: function(data){
                        console.log(data);
                        $("#addUserModal").modal("hide");
                        getAllUsers();
                        showSnackbar("User " + Mail + "has been successfully created")
                    },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert("The provided email is not unique");
            } 
            });

}

function createRole(){
        var args = buildNewRoleArguments();
	$.ajax({url: "http://"+ window.location.hostname + ":5000/admin/roles/create",
            data: args,
            type: "GET",
            success: function(data){
                data = updateToken(data);
                        console.log(data);
                        $("#rolesModal").modal("hide");
                        showSnackbar("Role " + args.role + "has been successfully created")
                    },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert("The provided email is not unique");
            } 
            });

}

function buildNewRoleArguments(){
    var RoleName = $("#roleInput").val();
    var permsC = "";
    if(document.getElementById("CreateC").checked) permsC +="c";
    if(document.getElementById("ReadC").checked) permsC +="r";
    if(document.getElementById("UpdateC").checked) permsC +="u";
    if(document.getElementById("DeleteC").checked) permsC +="d";
    var permsP = "";
    if(document.getElementById("CreateP").checked) permsP +="c";
    if(document.getElementById("ReadP").checked) permsP +="r";
    if(document.getElementById("UpdateP").checked) permsP +="u";
    if(document.getElementById("DeleteP").checked) permsP +="d";
    
    return {role : RoleName, 
            permC: permsC, 
            permP: permsP,
            admin: document.getElementById("Admin").checked,
            token: getCookie("AuthToken")};
}

function showSnackbar(myMessage) {
    'use strict';
    var snackbarContainer = document.querySelector('#demo-snackbar-example');
    var data = {
        message: myMessage,
        timeout: 2000,
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

String.prototype.replaceAll = function (target, replace) {
    return this.split(target).join(replace);
};

function updateUser(ID){
    console.log("triggered");
    let Name = $("#"+ID+" td[name='namefield']").text();
    let Email = $("#"+ID+" td[name='mailfield']").text();
    let Role = $("#"+ID+" select[name='rolefield']").val();
    	$.ajax({url: "http://"+ window.location.hostname + ":5000/admin/updateuser",
            data: {token : getCookie("AuthToken"),id:ID, email: Email, name: Name, role: Role},
            type: "POST",
            success: function(data){
                        data = updateToken(data);
                        console.log(data);
                        showSnackbar("Updated user data for " + Name);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                        showSnackbar("Update for " + Name + " failed");
            } 
            });

}


function displayUsers(){
var template =      "<tr id='__IDREPLACE__'>"+
                    "   <td name='namefield' class='mdl-data-table__cell--non-numeric'>__NAMEREPLACE__</td>"+
                    "   <td name='mailfield' class='mdl-data-table__cell--non-numeric'>__EMAILREPLACE__</td>"+
                    "   <td class='mdl-data-table__cell--non-numeric'>"+
                    "       <select name='rolefield'>"+
                    "__ROLESREPLACE__"+
                    "       </select>"+
                    "   </td>"+
                    "   <td class='mdl-data-table__cell--non-numeric'><button onclick=\"updateUser('__IDREPLACE__')\" class='mdl-button'>Change Value</button></td>"+
                    "</tr>";
    var roleOptions = addOptions();
    $("#userTable").empty();
    for(let i = 0; i < users.length; i++){
        let user = users[i];
        let option = template;
        option = option.replaceAll("__NAMEREPLACE__", user.name
                ).replaceAll("__IDREPLACE__", user.id
                ).replaceAll("__EMAILREPLACE__", user.email
                ).replaceAll("__ROLESREPLACE__", roleOptions);
        $("#userTable").append(option);
        $("#"+user.id + " option[value='"+user.role+"']").attr("selected", true);
    }
            
}

function displayRoles(){
var template =      "<tr id='__IDREPLACE__'>"+
                    "   <td name='role' class='mdl-data-table__cell--non-numeric'>__ROLEREPLACE__</td>"+
                    "   <td name='permPages' class='mdl-data-table__cell--non-numeric'>__PPREPLACE__</td>"+
                    "   <td name='permContent' class='mdl-data-table__cell--non-numeric'> __PCREPLACE__</td>"+
                    "   <td name='isAdmin' class='mdl-data-table__cell--non-numeric'> __ADMINREPLACE__</td>"+
                    "   <td class='mdl-data-table__cell--non-numeric'><button onclick=\"updateRole('__IDREPLACE__')\" class='mdl-button'>Change Value</button></td>"+
                    "</tr>";
    $("#roleTable").empty();
    for(let i = 0; i < roles.length; i++){
        let role = roles[i];
        let option = template;
        option = option.replaceAll("__ROLEREPLACE__", role.role
                ).replaceAll("__IDREPLACE__", role._id
                ).replaceAll("__PPREPLACE__", role.permissionPages
                ).replaceAll("__PCREPLACE__", role.permissionContent
                ).replaceAll("__ADMINREPLACE__", role.admin);
        $("#roleTable").append(option);
    }
            
}

function addOptions(){
    var template = "<option value='__NAMEREPLACE__'>__NAMEREPLACE__</option>";
    var ToRet = "";
    for(let i = 0; i < roles.length; i++){
        let role = roles[i];
        let option = template;
        ToRet += option.replaceAll("__NAMEREPLACE__", role.role); 
    }
    return ToRet;
}

function updateToken(data) {
    if ((typeof data) === "string")
        data = JSON.parse(data);
    document.cookie = "AuthToken=" + data.pop().token;
    return data;
}

function getAllUsers(){
    	$.ajax({url: "http://"+ window.location.hostname + ":5000/admin/getusers",
            data: {token: getCookie("AuthToken")},
            type: "GET",
            success: function(data){
                        users = [];
                        roles = [];
                        data = updateToken(data);
                        console.log(data);
                        for(var i = 0; i < data.length; i++){
                            users.push(data[i])
                        }
                        getAllRoles();
                    },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert("The provided email is not unique");
            } 
            });

}
var roles = []
var users = []

function getAllRoles(){
    	$.ajax({url: "http://"+ window.location.hostname + ":5000/admin/getroles",
            data: {token: getCookie("AuthToken")},
            type: "GET",
            success: function(data){
                        data = updateToken(data);
                        console.log(data);
                        for(var i = 0; i < data.length; i++){
                            roles.push(data[i])
                        }
                        displayUsers();
                        displayRoles();
                    },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert("The provided email is not unique");
            } 
            });

}


function addListeners(){
    getAllUsers();
    addTabListener();
}

function addTabListener() {
    var tabs = document.querySelectorAll('.custom_tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function (e) {
            document.querySelector("section.is-active").classList.toggle("is-active");
            var tabname = e.target.id.replace("tab-", "");
            curPage = tabname;
            console.log(tabname);
            document.getElementById(tabname).classList.toggle("is-active");
            document.querySelector("a.is-active").classList.toggle("is-active");
            document.getElementById(e.target.id).classList.toggle("is-active");
        });
    }
}


var currentUnstaged = []

function getUnstagedPages(){
        $.ajax({url: "http://" + window.location.hostname + ":5000/page/archive/get",
        data: {
            token: getCookie("AuthToken"),
            filter: "{}"
        },
        type: "GET",
        success: function (data) {
            data = updateToken(data);
            data.forEach(x=>{currentUnstaged.push(x)})
            displayUsers();
            showSnackbar("Unstaged pages have been pulled")
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("New Page could not be saved. Either you don't have the necessary permissions or an error occurred");
        }

    });
}

function displayUsers(){
    let seen = [];
    currentUnstaged.forEach(x=>{
        let author = x.user;
        if(seen.includes(author)) return;
        seen.push(author);
    })
    
    seen.forEach(x=>{
        $("#unstagedUsers").append("<div class='uUser'>"+ x+ "</div>")
    })
}