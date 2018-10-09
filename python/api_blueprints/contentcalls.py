from urllib import request
from flask import Blueprint, request, Response
from database_methods.dbMethods import *

contentAPI = Blueprint("contentAPI", __name__)

@contentAPI.after_request
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

@contentAPI.route("/content/create",  methods=['GET', 'POST'])
def createContent():
    kws = request.form.get("kw").split(",")
    text = request.form.get("text")
    branch = request.form.get("branch", "BeautyAndWellness")
    cats = request.form.get("cats").split(",")
    ToWrite = {"branch": branch, "categories": cats, "text": text, "keywords": kws}
    insertEntry(ToWrite, "content")
    return json.dumps([{"result": "OK"}])


@contentAPI.route("/content/read/keyword",  methods=['GET', 'POST'])
def readKeywordContent():
    KWs = request.args.get("value", "")
    ToMatch = [x.replace(" ", "") for x in KWs.split(",")]
    results = readKeywords(ToMatch)
    ToRet = []
    for res in results:
        ToRet.append({"keywords": res["keywords"], "text": res["text"], "id": str(res["_id"]), "branch": res["branch"],
                      "cat": res["categories"]})
    return Response(json.dumps(ToRet),mimetype="application/json")


@contentAPI.route("/content/read/text",  methods=['GET', 'POST'])
def readTextContent():
    Partial = request.args.get("value", "")
    results = readPartialText(Partial)
    ToRet = []
    for res in results:
        ToRet.append({"keywords": res["keywords"], "text": res["text"], "id": str(res["_id"]), "branch": res["branch"],
                      "cat": res["categories"]})
    return Response(json.dumps(ToRet),mimetype="application/json")


@contentAPI.route("/content/update",  methods=['GET', 'POST'])
def updateContent():
    cats = request.form.get("cats").split(",")
    kws = request.form.get("kw").split(",")
    text = request.form.get("text")
    token = checkToken(request.form.get("token")).get("email")
    ID = request.form.get("id")
    toUpdate = {"$set": {"text": text, "keywords": kws, "categories": cats}}
    return json.dumps([{"result":"OK"}]) if updateEntry(toUpdate, "content", ID, token) else Response(json.dumps([{"result":"not OK"}]), status=406)


@contentAPI.route("/content/delete",  methods=['GET', 'POST'])
def deleteContent():
    ID = request.args.get("id")
    deleteEntry(ID, "content")
    return json.dumps([{"result": "OK"}])
