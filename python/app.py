from urllib import request

from flask import Flask, request, Response
from flask_cors import CORS

from api_blueprints.admincalls import adminAPI
from api_blueprints.contentcalls import contentAPI
from api_blueprints.pagecalls import pagesAPI
from api_blueprints.usercalls import userAPI
from database_methods.dbMethods import *

app = Flask(__name__)
app.register_blueprint(userAPI)
app.register_blueprint(contentAPI)
app.register_blueprint(adminAPI)
app.register_blueprint(pagesAPI)
CORS(app)


@app.route("/help")
def help():
    toShow = {"API_endpoints": [{
                "endpoint":"/content/create",
                "description": "creates a new content block",
                "attributes":{
                    "kw": "keywords",
                    "text": "text content",
                    "cats": "corresponding categories",
                    "branch": "corresponding Branch"
                    }
                },{
                "endpoint":"/content/update",
                "description": "updates existing Content block. Category and branch can not be changed after creation.",
                "attributes":{
                    "kw": "new keywords",
                    "text": "new text content",
                    "id": "database id of content block to update",
                    }
                },{
                "endpoint":"/content/delete",
                "description": "deletes a content block",
                "attributes":{
                    "id": "id of content block to delete"
                    }
                }]
            }
    return toShow



#checks permission for request action before every request
#returns a permision info object if it's not permitted
@app.before_request
def authenticate():
    DBClient = getClient()
    route = str(request.path)
    if "/user/" not in str(request):
        token = request.form.get("token")
        if token == None: token = request.args.get("token")
        error = authenticateOnExecute(route, token)
        if error is not None:
            return Response(error, status=401)



if __name__ == "__main__":
   app.run("0.0.0.0")