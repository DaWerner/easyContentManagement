from urllib import request
from flask import Blueprint, request, Response
from database_methods.dbMethods import *

userAPI = Blueprint("userAPI", __name__)

@userAPI.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')

    if "logout" not in str(request) and "/user/" in str(request):
        return response
    token = request.form.get("token")
    if token is None:
        token = request.args.get("token")
    deleteToken(token)
    return response


@userAPI.route("/user/login", methods=['GET', 'POST'])
def checkInUser():
    Username = request.form.get("user")
    PW = request.form.get("pw")
    ret =  login(Username, PW)
    if ret == "-1":
        return Response({"result": "not OK"}, 401)
    return ret

@userAPI.route("/user/logout", methods=["GET", "POST"])
def checkoutUser():
    token = request.form.get("token")
    print(token)
    logout(token)
    return "1"

@userAPI.route("/user/getown")
def getOwnUser():
    token = request.args.get("token")
    user = checkToken(token)
    extended = getSpecificUser(user["email"])
    return json.dumps({"username": extended["email"],
                       "role": extended["role"],
                       "name": extended["name"],
                       "permissions": extended["permissions"]})


@userAPI.route("/user/register", methods=["GET", "POST"])
def registerUser():
    user = request.form.get("email")
    pw = request.form.get("pw")
    name = request.form.get("name")
    role = request.form.get("role")
    userObj = {"email": user, "role": role, "pw": pw, "name": name}
    if createUser(userObj):
        return json.dumps([{"result": "OK"}])
    else:
        return Response(json.dumps([{"result": "not OK"}]), status=401)


@userAPI.route("/user/changeownpw", methods=["GET", "POST"])
def changeOwnPW():
    token = request.form.get("token")
    newPW = request.form.get("newPW")
    user = checkToken(token)["email"]
    updateUserPW(user, newPW)
    return json.dumps([{"result": "OK"}])