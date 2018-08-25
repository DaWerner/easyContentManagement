function setGlobListeners(){
    document.querySelector('.mdl-menu>div').addEventListener('click', function (event) {
        event.stopPropagation();
    });

    document.querySelector('.mdl-menu>div').addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) { // 13 is enter
            search();
        }
    });
}


function addNodeEvents() {
    document.querySelectorAll('.draggablePara').forEach(x => {
        x.addEventListener('click', function (event) {
            var ind = event.currentTarget.dataset.pageindex;
            toogleToolbars(ind);
        })
    });
    $('.custom_toolbar button').click(function (e) {
        var command = $(this).data('command');

        if (command === 'h1' || command === 'h2' || command === 'p'|| command === 'h3') {
            document.execCommand('formatBlock', false, command);
        }

        if (command === 'createlink' || command === 'insertimage') {
            url = prompt('Enter the link here: ', 'http:\/\/');
            document.execCommand($(this).data('command'), false, url);
        } else
            document.execCommand($(this).data('command'), false, null);
        
    });
}

function addTabListener() {
    var tabs = document.querySelectorAll('.custom_tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function (e) {
            document.querySelector("section.is-active").classList.toggle("is-active");
            var tabname = e.target.id.replace("tab-", "");
            curPage = tabname;
            document.getElementById(tabname).classList.toggle("is-active");
            document.querySelector("a.is-active").classList.toggle("is-active");
            document.getElementById(e.target.id).classList.toggle("is-active");
        });
    }
}

function addPageListener() {
    var tabs = document.querySelectorAll('.pageSelect');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function (e) {
            document.querySelector("section.is-active").classList.toggle("is-active");
            var tabname = e.target.id.replace("pageOption-", "");
            curPage = tabname;
            document.getElementById(tabname).classList.toggle("is-active");
            let prevAct = document.querySelector("div.is-active");
            if(prevAct) prevAct.classList.toggle("is-active");
            document.getElementById(e.target.id).classList.toggle("is-active");
            $("#tabs").empty();
            $("#tabs").append("<a id='tab-blocks' class='custom_tab'>Edit Content</a>");
            $("#tabs").append("<a id='tab-" + tabname+ "' class='custom_tab is-active'>Edit Page</a>");
            addTabListener();
            document.querySelectorAll(".pTitle").forEach(x=>{$(x).text(tabname)});
        });
    }
}