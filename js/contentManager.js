/* Global Variables attached to the window object
 */
var pages = [];
var activeUser = {};
var curPage = "";
var searchmode = "/content/read/text";
var TextResults = []
var current = "";


String.prototype.replaceAll = function (target, replace) {
    return this.split(target).join(replace);
};


function toogleToolbars(index) {
    document.querySelectorAll(".custom_toolbar").forEach(x => {
        x.classList.add("toolbar_hidden");
    })
    var selector = "#paragraphs-" + getCurrentPage().pageName + " .custom_toolbar[data-pInd='" + index + "']"
    document.querySelector(selector).classList.remove("toolbar_hidden");
}


function moveDown(ele) {
    let index = $(ele).parent().parent().data("pageindex");
    if (index === document.querySelectorAll("#paragraphs-" + getCurrentPage().pageName + " .draggablePara").length - 1)
        return;
    let curPageParas = getCurrentPage().paragraphs;
    let toMove = curPageParas[index];
    let toReplace = curPageParas[index + 1];
    let pageIndex = pages.indexOf(getCurrentPage());
    pages[pageIndex].paragraphs[index + 1] = toMove;
    pages[pageIndex].paragraphs[index] = toReplace;
    document.querySelectorAll("#paragraphs-" + getCurrentPage().pageName + " .draggablePara").forEach(x => {
        $(x).remove()
    })
    loadContentNodes(getCurrentPage());

}

function moveUp(ele) {
    let index = $(ele).parent().parent().data("pageindex");
    if (index === 0)
        return;
    let curPageParas = getCurrentPage().paragraphs;
    let toMove = curPageParas[index];
    let toReplace = curPageParas[index - 1];
    let pageIndex = pages.indexOf(getCurrentPage());
    pages[pageIndex].paragraphs[index - 1] = toMove;
    pages[pageIndex].paragraphs[index] = toReplace;
    document.querySelectorAll("#paragraphs-" + getCurrentPage().pageName + " .draggablePara").forEach(x => {
        $(x).remove()
    })
    loadContentNodes(getCurrentPage());
}


function togglePageDispl(elem) {
    if (elem.classList.contains("active"))
        removePages(elem);
    else
        loadPages(elem);
}

function removePages(elem) {
    $("#textList").empty();
    elem.classList.toggle("active");
    elem.parentElement.querySelectorAll(".pageSelect").forEach(x => {
        let sectionName = x.id.replace("pageOption-", "");
        $("#" + sectionName).remove();
    });
    elem.parentElement.querySelectorAll(".page_item").forEach(x => $(x).remove());
    displayTexts();
    $("#tabs").empty();
    $("#tabs").append("<a id='tab-blocks' class='custom_tab is-active'>Edit Content</a>");
    document.getElementById("blocks").classList.add("is-active");
    addTabListener();
    $("#pTitle").text("Pages");
}



function setBtnActivity(elem) {
    elem.classList.toggle("tb_btn_active");
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
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


function getActiveCategories() {
    let wantedCats = [];
    document.querySelectorAll(".nav_bar_item .active").forEach(x => {
        wantedCats.push(x.id.replace("list-checkbox-", ""));
    });
    return wantedCats;
}

function updateToken(data) {
    if ((typeof data) === "string")
        data = JSON.parse(data);
    document.cookie = "AuthToken=" + data.pop().token;
    return data;
}

function addToClipboard() {
    var selected = $("#pageSelect").val();
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        if (page.pageName === selected) {
            page.clipboard.push(document.getElementById("editor").innerHTML);
            fillPageClipboard(page);
        }
    }
    showSnackbar("Text has been added to the Clipboard of Page " + selected);
}


function generateKeywords() {
    if (!document.getElementById("generateKW").checked)
        return;
    var Text = document.getElementById("editor").innerHTML;
    var words = Text.split(" ");
    var Nouns = [];
    for (var i = 0; i < words.length; i++) {
        if ((words[i].charCodeAt(0) > 64 && words[i].charCodeAt(0) < 64 + 27) &&
                !words[i].match("<.*>") && !words[i].match(".*&.*")) {
            Nouns.push(words[i].replace(",", ""));
        }
    }
    var Counts = {};
    for (var i = 0; i < Nouns.length; i++) {
        var num = Nouns[i];
        Counts[num] = Counts[num] ? Counts[num] + 1 : 1;
        var top3 = [{val: "", count: 0}, {val: "", count: 0}, {val: "", count: 0}];
        for (var val in Counts) {
            for (var j = 0; j < 3; j++) {
                if (Counts[val] > top3[j].count) {
                    top3[j].val = val;
                    top3[j].count = Counts[val];
                    break;
                }
            }
        }
        var kws = top3[0].val + "," + top3[1].val + "," + top3[2].val;
        $("#keywords").empty();
        $("#keywords").val(kws);

    }
}


function toggleSearch() {
    $("#textDiv").toggle();
    $("#kwDiv").toggle();
    if (searchmode === "/content/read/text") {
        searchmode = "/content/read/keyword";
    } else {
        searchmode = "/content/read/text";
    }
}

function enableModalButton() {
    if (current === "") {
        document.getElementById("saveBtn").style.display = "none";
        document.getElementById("delBtn").style.display = "none";
    } else {
        document.getElementById("saveBtn").style.display = "inline";
        document.getElementById("delBtn").style.display = "inline";
    }
}


function reset() {
    current = "";
    document.getElementById("editor").innerHTML = "";
    document.getElementById("keywords").value = "";
    document.getElementById("branchInput").value = "";
    document.getElementById("catsInput").value = "";

    showSnackbar("Editor has been cleared")
}



function filterPages() {
    var filter = document.getElementById("pageFilter").value;
    var tabs = document.querySelectorAll('.custom_tab');
    for (var i = 1; i < tabs.length; i++) {
        var tabName = tabs[i].id.replace("tab-");
        if (!tabName.includes(filter)) {
            tabs[i].style.display = "none";
        } else {
            tabs[i].style.display = "block";
        }
    }
}




function sanitizeText(needle, haystack, repl) {
    var arr = haystack.split(" ");
    for (var i = 0; i < arr.length; i++) {
        while (arr[i].includes(needle)) {
            arr[i] = arr[i].replace(needle, repl);
        }
    }
    return arr.join(" ");
}

function copyToCB() {
    /* Get the text field */
    $("#copyInput").empty();
    $("#copyInput").val($("#textContent").text());
    var copyText = document.getElementById("copyInput");

    /* Select the text field */
    document.getElementById("copyInput").style.display = "block";
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    document.getElementById("copyInput").style.display = "none";
    showSnackbar("Text of page " + getCurrentPage().pageName + " has been copied to your clipboard");
}


function dragListItem(ev) {
    ev.dataTransfer.setData("textID", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function updateNode(ele) {
    var index = ele.dataset.pageindex;
    var page = getCurrentPage();
    var text = $(ele).children(".innerContent").html();
    text = text.replace("cached", "")
    page.paragraphs[index] = text;
}


function getCurrentPage() {
    for (var i = 0; i < pages.length; i++) {
        if (pages[i].pageName === curPage) {
            return pages[i];
        }
    }
}

function dumpRaw() {
    var ModalBody = $("#textContent");
    var page = getCurrentPage();
    ModalBody.empty();
    for (var i = 0; i < page.paragraphs.length; i++) {
        ModalBody.append(page.paragraphs[i]);
    }
}

function dropListItem(ev) {
    var data = ev.dataTransfer.getData("textID");
    var listIndex = parseInt(data.replace("content_", ""));
    var page = getCurrentPage();
    var Text = "";
    for (let i = 0; i < TextResults.length; i++) {
        if (TextResults[i].id === data)
            Text = TextResults[i].text;
    }
    var impText = sanitizeText("&lt;", Text, "<");
    impText = sanitizeText("&gt;", impText, ">");

    page.paragraphs.push(impText);
    document.querySelectorAll("#paragraphs-" + page.pageName + " .draggablePara").forEach(x => {
        $(x).remove()
    })
    loadContentNodes(page)

}

function createNewPage(Page) {
    var Text = [];

    var myPage = null;

    if (Page === null || Page === undefined) {
        myPage = getCurrentPage();
    } else {
        myPage = Page;
    }
    var wantedCats = getActiveCategories();
    var Branch = "BeautyAndWellness";
    var Token = getCookie("AuthToken");
    var dString = JSON.stringify({text: myPage.paragraphs,
        cats: wantedCats,
        branch: Branch,
        pageName: myPage.pageName,
        clipboard: myPage.clipboard,
        paragraphs: myPage.paragraphs
    })

}


function deleteContentNode(elem) {
    var page = getCurrentPage();
    var index = $(elem).parent().parent().data("pageindex");
    var newPars = [];
    for (var i = 0; i < page.paragraphs.length; i++) {
        if (i !== index) {
            newPars.push(page.paragraphs[i]);
        }
    }
    page.paragraphs = newPars;
    $(elem).parent().parent().remove();
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


function importText(id) {
    var toImport;
    for (var i = 0; i < TextResults.length; i++) {
        let text = TextResults[i];
        if (text.id === id) {
            toImport = text;
            break;
        }
    }
    let impText = sanitizeText("&lt;", toImport.text, "<");
    impText = sanitizeText("&gt;", impText, ">");
    $("#editor").empty();
    $("#editor").append(impText);
    $("#catsInput").val(toImport.cat.join());
    $("#branchInput").val(toImport.branch)
    $("#keywords").empty();
    $("#keywords").val(toImport.keywords);
    generateKeywords();
    current = toImport.id;
}
