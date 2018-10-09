from urllib import request
from flask import Blueprint, request, Response
from database_methods.dbMethods import *
import json

pagesAPI = Blueprint("pagesAPI", __name__)

@pagesAPI.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')

    token = request.form.get("token")
    if token is None:
        token = request.args.get("token")
    newToken = updateToken(token)
    data = response.get_data(as_text=True)
    d= []
    d = json.loads(data)
    d.append({"token": str(newToken)})
    response.set_data(json.dumps(d))
    return response

@pagesAPI.route("/page/create",  methods=['GET', 'POST'])
def createPage():
    data = json.loads(request.form.get("datastring"))
    if getPageID(data["pageName"]) == 0:
        insertEntry(data, "page")
        return json.dumps({"result":"OK"})
    else:
        return Response(json.dumps([{"result":"Already Exists"}]), status=406)



@pagesAPI.route("/page/read",  methods=['GET', 'POST'])
def readPage():
    cats = request.args.get("categories", "other").split(",")
    results = []
    for cat in cats:
        len(readPages(cat))
        for entry in readPages(cat):
            results.append(entry)
    ToRet = []
    for res in results:
        res = res
        ToRet.append({"pageName": res["pageName"], "text": res["paragraphs"], "id": str(res["_id"]), "branch": res["branch"], "clipboard": res["clipboard"], "cat": res["cats"]})
    return json.dumps(ToRet, ensure_ascii=False)

@pagesAPI.route("/page/update",  methods=['GET', 'POST'])
def updatePage():
    datastring = json.loads(request.form.get("datastring"))
    parags = datastring.get("paragraphs", [])
    branch = datastring.get("branch", "other")
    pName = datastring.get("pageName", None)
    text = datastring.get("text")
    cBoard = datastring.get("clipboard", [])
    pID = getPageID(datastring["pageName"])
    print(pID)
    user = checkToken(request.form.get("token"))
    if pID != 0:
        datastring["cats"].extend(x for x in getPageCategories(pID) if x not in datastring["cats"])
    else:
        createPage()
        print("created")
        return json.dumps([{"result": "OK"}])
    cats = datastring.get("cats", ["other"])
    toUpdate = {"$set": {"paragraphs": parags,
                         "pageName": pName,
                         "text": text,
                         "clipboard": cBoard,
                         "branch": branch,
                         "cats": cats}}

    updateEntry(data=toUpdate, database="pages", ID=pID, user=user["email"])
    return json.dumps([{"result": "OK"}])


@pagesAPI.route("/page/delete",  methods=['GET', 'POST'])
def deletePage():
    pid = getPageID(request.args.get("pageName"))
    deleteEntry(pid, "pages")