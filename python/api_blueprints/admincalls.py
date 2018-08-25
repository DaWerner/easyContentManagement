from urllib import request
from flask import Blueprint, request, Response
from database_methods.dbMethods import *

adminAPI = Blueprint("adminAPI", __name__)

@adminAPI.after_request
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

@adminAPI.route("/admin/updateuser", methods=["GET", "POST"])
def updateuser():
    args = request.form
    ID = args.get("id")
    Email = args.get("email")
    Name = args.get("name")
    Role = args.get("role")
    if Role not in [x["role"] for x in getAllRoles()]:
        return Response(json.dumps([{"result": "not OK"}]), status=400)
    Data = {"role": Role, "name": Name, "email": Email}
    return json.dumps([{"result": "OK"}]) if updateUser(ID, Data) else Response(json.dumps([{"result": "not OK"}]), status=503)


@adminAPI.route("/admin/roles/create", methods=["GET", "POST"])
def createUserRole():
    args = request.args
    role = args.get("role", "none")
    permsC =args.get("permC", "none")
    permsP = args.get("permP", "none")
    admin = False if args.get("admin", "false") == "false" else True
    if role == "none" or permsC == "none" or permsP == "none":
        return Response(json.dumps([{"result": "not OK"}]), 400)
    else:
        insertPermission({"role": role,
                          "permissionContent": [x for x in permsC],
                          "permissionPages": [x for x in permsP],
                          "admin": admin}
                         )
        return json.dumps([{"result": "OK"}])


@adminAPI.route("/admin/getusers", methods=['GET', 'POST'])
def getUsers():
    return json.dumps(getAllUsers())


@adminAPI.route("/admin/getroles", methods=['GET', 'POST'])
def getRoles():
    return json.dumps(getAllRoles())
