
function formatKeywords(str) {
    var arr = str.split(",");
    for (var i = 0; i < arr.length; i++) {
        while (arr[i].includes(" ")) {
            arr[i] = arr[i].replace(" ", "");
        }
    }
    return arr.join();
}

function showSavePage(){
    let page = getCurrentPage();
    $("#pageNameDispl").text(page.pageName);
    $("#catsDispl").val(page.category.join());
    $("#branchDispl").val(page.branch);
    $("#savePage").modal("show");
}


function prepPageSelect() {
    $("#pageSelect").empty();
    $("#pageSelect").append("<option value='global'>Global</option>");
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        $("#pageSelect").append("<option value='" + page.pageName + "'>" + page.pageName + "</option>");
    }
    $("#cbModal").modal("show");
}

function fillPageClipboard(page) {

    var template = "<li id='__IDREPLACE__' draggable='true' ondragstart='dragListItem(event)' onclick=\"importText('__IDREPLACE__')\" class='mdl-list__item draggable_list_item custom_tooltip'>\n\
                        <span class=' text_list_items mdl-list__item-primary-content'>\n\
                            __TEXTTEASER__\n\
                        </span>\n\
                        <div class='custom_tooltiptext'>Text:<br>__TEXTREPLACE__</div>\n\
                    </li>\n";
    var ToAppend = "";
    $("#clipBoard_" + page.pageName).empty();
    for (var i = 0; i < page.clipboard.length; i++) {
        var text = page.clipboard[i]
        var teaser = text;
        var id = "content_" + i;
        teaser = teaser.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
        teaser = sanitizeForClipboard(teaser)
        teaser = teaser.replaceAll("<", "&lt;").replaceAll( ">", "&gt;");
        $("#cheat").append(teaser);
        teaser = (teaser.slice(0, 30) + "<br>" + teaser.slice(30, 60) + "...").replace("\n", " ");
        val = template;
        val = val.replace("__IDREPLACE__", id);
        val = val.replace("__IDREPLACE__", id);
        val = val.replace("__TEXTTEASER__", teaser);
        val = val.replace("__TEXTREPLACE__", $("#cheat").text());
        $("#cheat").empty();
        ToAppend += val;
    }
    $("#clipBoard_" + page.pageName).append(ToAppend);
}



function buildToolbar(pInd) {
    var toolbar = "<div class='custom_toolbar toolbar_hidden' data-pInd='" + pInd + "'>\n\
                    <button  data-command='bold'><i class='fa fa-bold'></i></button>\
                    <button  data-command='italic'><i class='fa fa-italic'></i></button>\
                    <button  data-command='underline'><i class='fa fa-underline'></i></button>\
                    <button  data-command='strikeThrough'><i class='fa fa-strikethrough'></i></button>\
                    <button  data-command='justifyLeft'><i class='fa fa-align-left'></i></button>\
                    <button  data-command='justifyCenter'><i class='fa fa-align-center'></i></button>\
                    <button  data-command='justifyRight'><i class='fa fa-align-right'></i></button>\
                    <button  data-command='justifyFull'><i class='fa fa-align-justify'></i></button>\
                    <button  data-command='indent'><i class='fa fa-indent'></i></button>\
                    <button  data-command='outdent'><i class='fa fa-outdent'></i></button>\
                    <button  data-command='insertUnorderedList'><i class='fa fa-list-ul'></i></button>\
                    <button  data-command='insertOrderedList'><i class='fa fa-list-ol'></i></button>\
                    <button  data-command='h1'>H1</button>\
                    <button  data-command='h2'>H2</button>\
                    <button  data-command='h3'>H3</button>\
                    <button data-command='p'>P</button>\
                    <button data-command='createlink'><i class='fa fa-link'></i></button>\
                    <button data-command='unlink'><i class='fa fa-unlink'></i></button>\
                    <button data-command='subscript'><i class='fa fa-subscript'></i></button>\
                    <button data-command='superscript'><i class='fa fa-superscript'></i></button>\
                    <button data-command='undo'><i class='fa fa-undo'></i></button>\
                    <button data-command='redo'><i class='fa fa-repeat'></i></button>\
                    </div>";
    return toolbar;
}


function autoCompleteCats(elem, top, left){
    if($(".ac_container")) $(".ac_container").remove();
    $(elem).after("<div class=ac_container></div>")
    $(".ac_container").css("width", getComputedStyle(elem).width)
    let added = [];
    TextResults.forEach(x=>{
            x.cat.forEach(y=>{
                let last = elem.value.split(",")[elem.value.split(",").length-1];
                if(y.includes(last) && !added.includes(y)){
                    added.push(y);
                    $(".ac_container").append("<span onclick=\"setValue('"+y+"', '"+elem.id+"')\">"+ y + "</span><br>");
                }
            });
        }
    );
}

function autoCompleteBranch(elem, top, left){
    if($(".ac_container")) $(".ac_container").remove();
    $(elem).after("<div class=ac_container></div>")
    $(".ac_container").css("width", getComputedStyle(elem).width)
    let added = [];
    TextResults.forEach(x=>{
                if(x.branch.includes(elem.value) && !added.includes(x.branch)){
                    added.push(x.branch);
                    $(".ac_container").append("<span onclick=\"setValue('"+x.branch+"', '"+elem.id+"')\">"+ x.branch + "</span><br>");
                }
        }
    );
}

function setValue(val, elemID){
    let cats = document.getElementById(elemID).value.split(",");
    cats[cats.length-1] = val;
    document.getElementById(elemID).value = cats.join();
    $(".ac_container").remove();
}


function loadContentNodes(page) {
    var ToAppend = "<div onkeyup='updateNode(this)' class='draggablePara ignoreWhileReading' data-pageindex='__INDEXREPLACE__' contenteditable='true'>" +
            "<div contenteditable='false'><button type='button'  onclick='deleteContentNode(this)' class='mdl-chip__action' style='float:right;'><i class='material-icons'>cancel</i></button>"+
            "<button type='button'  onclick='moveUp(this)' class='mdl-chip__action' style='float:right;'><i class='material-icons'>arrow_drop_up</i></button>"+
            "<button type='button'  onclick='moveDown(this)' class='mdl-chip__action' style='float:right;'><i class='material-icons'>arrow_drop_down</i></button></div>";
            
    for (var i = 0; i < page.paragraphs.length; i++) {
        var impText = "<div class='innerContent'>" + sanitizeText("&lt;", page.paragraphs[i], "<");
        impText = sanitizeText("&gt;", impText, ">");
        var temp = buildToolbar(i) + ToAppend + impText + "</div>";
        temp = temp.replace("__INDEXREPLACE__", i);
        $("#paragraphs-" + page.pageName).append(temp);
    }
}

function displayTexts() {
    var wantedCats = getActiveCategories();
    
    var template = "<li id='__IDREPLACE__' draggable='true' ondragstart='dragListItem(event)' onclick=\"importText('__IDREPLACE__')\" class='mdl-list__item draggable_list_item custom_tooltip'>\n\
                        <span data-kw='__KEYWORDS__' class=' text_list_items mdl-list__item-primary-content'>\n\
                            __TEXTTEASER__\n\
                        </span>\n\
                        <div class='custom_tooltiptext'>Text:<br>__TEXTREPLACE__<br>Keywords:<br>__KEYWORDS__</div>\n\
                    </li>\n";
    var ToAppend = "";
    $("#textList").empty();
    var count = 0;
    for (var i = 0; i < TextResults.length; i++) {
        var text = TextResults[i]
        var corrCat = false;
        for (var l = 0; l < wantedCats.length; l++) {
            if (text.cat.includes(wantedCats[l]))
                corrCat = true;
        }
        if (!corrCat)
            continue;
        count++;
        var kws = text.keywords.join();
        var id = text.id;
        var teaser = text.text
        teaser = teaser.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
        teaser = sanitizeForClipboard(teaser)
        teaser = teaser.replaceAll("<", "&lt;").replaceAll( ">", "&gt;");
        $("#cheat").append(teaser);
        teaser = (teaser.slice(0, 30) + "<br>" + teaser.slice(30, 60) + "...").replace("\n", " ");
        $("#cheat").empty();
        var val = template;
        val = val.replace("__IDREPLACE__", id);
        val = val.replace("__IDREPLACE__", id);
        val = val.replace("__TEXTTEASER__", teaser);
        val = val.replace("__KEYWORDS__", kws);
        val = val.replace("__TEXTREPLACE__", text.text);
        val = val.replace("__KEYWORDS__", kws.replaceAll(",", ", "));
        ToAppend += val;
    }
    $("#resCount").text(count)
    $("#textList").append(ToAppend);
}

function sanitizeForClipboard(text){
    return text.split(/ *<[^>\s]*\>/g).join("");
}

function fillNavBar() {
    var template = "<p>" +
            "<a class='category_link' data-toggle='collapse' style='color:white;' href='#__IDREPLACE0__' role='button' aria-expanded='false' aria-controls='__IDREPLACE1__'>" +
            "__BRANCHREPLACE__" +
            "</a>" +
            "</p>" +
            "<div class='collapse' id='__IDREPLACE2__'>" +
            "<ul class='demo-list-control mdl-list'>";

    var OptionsTemplate = "<li class='mdl-list__item nav_bar_item'>" +
            "<span class='mdl-list__item-primary-content' id='list-checkbox-__CATREPLACE2__' onclick='togglePageDispl(this);'>" +
            "  __CATREPLACE0__" +
            "</span>" +
            "</li>";

    var endTemplate = "</ul>" +
            "</div>";
    var ToAppend = "";
    $("#navBar").empty();
    var points = {};
    for (var l = 0; l < TextResults.length; l++) {
        var branch = TextResults[l].branch;
        if (!(branch in points)) {
            points[branch] = [];
        }
        for (var m = 0; m < TextResults[l].cat.length; m++) {
            let cat = TextResults[l].cat;
            if (!points[branch].includes(cat[m])) {
                points[branch].push(cat[m]);
            }
        }
    }
    for (var val in points) {
        var cats = points[val];
        cats.sort((a, b)=> {return a.toLowerCase().localeCompare(b.toLowerCase());});
        var id = val;
        var val = template;
        val = val.replace("__BRANCHREPLACE__", id);
        val = val.replace("__IDREPLACE0__", id);
        val = val.replace("__IDREPLACE1__", id);
        val = val.replace("__IDREPLACE2__", id);
        var dropdown = "";
        for (var j = 0; j < cats.length; j++) {
            var val2 = OptionsTemplate;
            val2 = val2.replace("__CATREPLACE0__", cats[j].replaceAll("PARENTHESISOPEN", "(").replaceAll("PARENTHESISCLOSE", ")"));
            val2 = val2.replace("__CATREPLACE1__", cats[j].replaceAll("PARENTHESISOPEN", "(").replaceAll("PARENTHESISCLOSE", ")"));
            val2 = val2.replace("__CATREPLACE2__", cats[j].replaceAll("PARENTHESISOPEN", "(").replaceAll("PARENTHESISCLOSE", ")"));
            dropdown += val2;
        }
        ToAppend += val + dropdown + endTemplate;
    }
    $("#navBar").append(ToAppend);


}

function displayPages(pages, ele){
   ele.classList.toggle("active");
   $(ele).parent().append("<div class='page_item'>")
   pages.sort();
   let PageDiv = "";
   pages.forEach(x=>{
        PageDiv +="<div id='pageOption-"+x+"' class='pageSelect'>"+x + "</div>";
    })
    let pageItem = ele.parentElement.querySelector(".page_item")
    $(pageItem).append(PageDiv);
    $(ele).append("</div>");

}

function addPage(Page) {
    var pName = "";
    var cats = [];
    if (Page === undefined) {
        pName = prompt("Choose a Pagename", "");
        if (pName === "" || pName === null)
            return;
        var wantedCats = getActiveCategories();
        cats = wantedCats.join();
    } else {
        pName = Page.pageName;
        cats = Page.category.join();
    }
    pName = pName.replaceAll(" ", "_")
    var Template = "   <section class='mdl-layout__tab-panel' id='__PNAMEREPLACE2__'>" +
            "<div class='pTitle'></div>"+
            "   <div class='page-content'>" +
            "   <div class='mdl-grid  '>" +
            "   <div class=' mdl-shadow--2dp mdl-cell mdl-cell--8-col mdl-grid main_content_card'>" +
            "   <div class='container' id='paragraphs-__PNAMEREPLACE0__' ondragover='allowDrop(event)' ondrop='dropListItem(event)'>" +
            "   <button class='mdl-button' onclick='showSavePage()'>Save Page </button>" +
            "   <button class='mdl-button' onclick='dumpRaw();copyToCB()'>Copy Raw </button>" +
            "   <button class='mdl-button' onclick=\"dumpRaw();$('#rawModal').modal('show');\"> Show Raw Content </button></div></div>" +
            "   </div>" +
            "   </div>" +
            "   </section>";
    var toAppend = Template;
    toAppend = toAppend.replace("__PNAMEREPLACE0__", pName);
    toAppend = toAppend.replace("__PNAMEREPLACE1__", pName);
    toAppend = toAppend.replace("__PNAMEREPLACE2__", pName);
    $("main").append(toAppend);
    
    createNewPage({pageName: pName, clipboard: [], paragraphs: []})
    if (Page === undefined)
        pages.push({pageName: pName, clipboard: [], paragraphs: []});
}
