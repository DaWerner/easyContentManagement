/* Content Calls
 * Methods to request content from the database via Ajax
 * 
 */

function init() {
    setGlobListeners();
    $.ajax({url: "http://" + window.location.hostname + ":5000/content/read/text",
        data: {token: getCookie("AuthToken"),
            value: "",
        },
        type: "GET",
        success: function (data) {
            data = updateToken(data);
            TextResults = data;
            identUser();
            document.getElementById("pTextInput").value = "";
            document.getElementById("keywInput").value = "";
            fillNavBar();
            addNodeEvents();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("The passed Credential don't match a known account");
        }

    });


}

function createNewContent() {
    var Text = document.getElementById("editor").innerHTML;
    var Keywords = formatKeywords($("#keywords").val());
    var Token = getCookie("AuthToken");
    var categories = $("#catsInput").val();
    $.ajax({url: "http://" + window.location.hostname + ":5000/content/create",
        data: {token: Token,
            kw: Keywords,
            text: Text,
            cats: categories,
            branch: $("#branchInput").val()
        },
        type: "POST",
        success: function (data) {
            data = updateToken(data);
            $("#confirmModal").modal("hide");
            showSnackbar("New Text block has been added");
            search();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("Content Block could not be created. Either you don't have the necessary permissions or an error occurred");
        }

    });


}

function search() {
    var Mode = searchmode;
    var val = (Mode === "/content/read/text") ? document.getElementById("pTextInput").value : document.getElementById("keywInput").value;
    var Token = getCookie("AuthToken");
    $("#searchTerm").text(val);
    if (Mode === "") {
        alert("Please fill out all fields")
        return;
    }
    $.ajax({url: "http://" + window.location.hostname + ":5000" + searchmode,
        data: {token: Token,
            value: val,
        },
        type: "GET",
        success: function (data) {
            data = updateToken(data);
            TextResults = JSON.parse(JSON.stringify(data).replaceAll("PARENTHESISOPEN", "(").replaceAll("PARENTHESISCLOSE", ")"))

            document.getElementById("pTextInput").value = "";
            document.getElementById("keywInput").value = "";
            displayTexts();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("Content Blocks could not be looked up. Either you don't have the necessary permissions or an error occurred");
        }

    });


}

function createPlaceholderContent(){
    let newBranch = $("#newBranch").val().replaceAll(" ", "_");
    let newCat = $("#newCat").val();
        $.ajax({url: "http://" + window.location.hostname + ":5000/content/create",
        data: {token: getCookie("AuthToken"),
            kw: "none",
            text: "<div>&nbsp</div>",
            cats: newCat,
            branch: newBranch
        },
        type: "POST",
        success: function (data) {
            data = updateToken(data);
            createFirstPage();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("The passed Credential don't match a known account");
        }

    });

}


function updateContent() {
    var Text = document.getElementById("editor").innerHTML;
    var Keywords = formatKeywords($("#keywords").val());
    var cat = $("#catsInput").val();
    var Token = getCookie("AuthToken");
    $.ajax({url: "http://" + window.location.hostname + ":5000/content/update",
        data: {token: Token,
            kw: Keywords,
            text: Text,
            cats: cat,
            id: current
        },
        type: "POST",
        success: function (data) {
            data = updateToken(data);
            $("#confirmModal").modal("hide");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("Content Block could not be updated. Either you don't have the necessary permissions or an error occurred");
        }

    });


}


function deleteContent() {
    var confirm = prompt("Type 'yes' to confirm deletion", "");
    if (confirm !== "yes")
        return;
    var Token = getCookie("AuthToken");
    $.ajax({url: "http://" + window.location.hostname + ":5000/content/delete",
        data: {token: Token,
            id: current,
        },
        type: "GET",
        success: function (data) {
            data = updateToken(data);
            $("#confirmModal").modal("hide");
            document.getElementById("editor").innerHTML = "";
            $("#" + current).remove();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("Content Block could not be deleted. Either you don't have the necessary permissions or an error occurred");
        }

    });


}

/* Page Calls
 * Methods to request pages from the database via Ajax
 * 
 */




function updatePage() {
    var Text = [];
    var delBtn = "<button type=\"button\" onclick=\"$(this).parent().remove()\" class=\"mdl-chip__action\" style=\"float:right;\"><i class=\"material-icons\">cancel</i></button><div>";
    /*var contentNodes = document.querySelectorAll("#paragraphs-" + curPage + " .draggablePara");
     for (var i = 0; i < contentNodes.length; i++) {
     var HTML = contentNodes[i].innerHTML;
     Text.push(HTML.replace(delBtn, ""));
     }*/
    var myPage = getCurrentPage();
    var wantedCats = $("#catsDispl").val().split(",");
    var Branch = $("#branchDispl").val();
    var Token = getCookie("AuthToken");
    var dString = JSON.stringify({text: myPage.paragraphs,
        cats: wantedCats,
        branch: Branch,
        pageName: myPage.pageName,
        clipboard: myPage.clipboard,
        paragraphs: myPage.paragraphs
    })
    $.ajax({url: "http://" + window.location.hostname + ":5000/page/update",
        data: {token: Token,
            datastring: dString,
        },
        type: "POST",
        success: function (data) {
            data = updateToken(data);
            showSnackbar("Content of Page " + getCurrentPage().pageName + " has been saved");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert(" Page could not be changed. Either you don't have the necessary permissions or an error occurred");
        }

    });


}

function loadPages(ele) {
    var cats = $(ele)[0].id.replace("list-checkbox-", "");

    var Token = getCookie("AuthToken");
    let pageDiv = [];
    $.ajax({url: "http://" + window.location.hostname + ":5000/page/read",
        data: {token: Token,
            categories: cats,
        },
        type: "GET",
        success: function (data) {
            var temp = updateToken(data);
            for (var i = 0; i < temp.length; i++) {
                var newPage = {paragraphs: temp[i].text,
                    pageName: temp[i].pageName.replaceAll("(", "_d_").replaceAll(")", "_b_"),
                    clipboard: temp[i].clipboard,
                    category: temp[i].cat,
                    branch: temp[i].branch
                };
                pages.push(newPage);
                addPage(newPage);
                //fillPageClipboard(newPage);
                loadContentNodes(newPage);
                pageDiv.push(newPage.pageName)
            }
            displayPages(pageDiv, ele);
            prepPageSelect();
            addNodeEvents();
            displayTexts();
            addTabListener();
            addPageListener();

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("Pages could not be loaded. Either you don't have the necessary permissions or an error occurred");
        }

    });


}

function createFirstPage(){
    var dString = JSON.stringify({text: [""],
    cats: $("#newCat").val().split(","),
    branch: $("#newBranch").val(),
    pageName: $("#newPage").val(),
    clipboard: [],
    paragraphs: []
    })
    $.ajax({url: "http://" + window.location.hostname + ":5000/page/update",
        data: {token: getCookie("AuthToken"),
            datastring: dString,
        },
        type: "POST",
        success: function (data) {
            data = updateToken(data);
            showSnackbar("New Item was created");
            init();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location ="./index.html";
            alert("New Page could not be saved. Either you don't have the necessary permissions or an error occurred");
        }

    });
}