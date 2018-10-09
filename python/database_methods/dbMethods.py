import pymongo
import re
from bson import ObjectId
import random
import json
from database_methods.archiveMethods import createContentVersion
from hashlib import sha256

def getClient():
    return pymongo.MongoClient('localhost:27017')


def readKeywords(ToMatch):
    client = getClient()
    db = client.contentManager
    results = []

    for kw in ToMatch:
        matches = db.content.find({"keywords": {"$in": [kw]}})
        for match in matches:
            if match not in results:
                results.append(match)
    client.close()
    return results


def logout(token):
    client =getClient()
    client.contentManager.cmLoggedUsers.delete_one({"token": token})


def login(user, pw):
    client =getClient()
    db = client.contentManager
    resCount = db.cmKnownUsers.find({"email": user, "pw": pw}).count()
    res = db.cmKnownUsers.find_one({"email": user, "pw": pw})
    resLogged = db.cmLoggedUsers.find({"email": user}).count()
    if resCount == 1 and resLogged == 1:
        return db.cmLoggedUsers.find_one({"email": user})["token"]
    elif resCount==1:
        randSeed = (user + ''.join(chr(random.randint(0, 255)))).encode("utf-8")
        hasher = sha256()
        hasher.update(randSeed)
        newToken = hasher.hexdigest()
        role = res["role"]
        client.contentManager.cmLoggedUsers.insert_one({"email": user, "token": newToken, "role": role})
        client.close()
        return str(newToken)
    else:
        client.close()
        return "-1"

def createUser(userObj):
    client =getClient()
    db = client.contentManager
    resCount = db.cmKnownUsers.find({"email": userObj["email"]}).count()
    if resCount >0:
        return False
    db.cmKnownUsers.insert_one(userObj)
    resCount = db.cmKnownUsers.find({"email": userObj["email"]}).count()
    client.close()
    return resCount == 1

def readPages(cat):
    client = getClient()
    db = client.contentManager
    results = []


    matches = db.pages.find({"cats": {"$in": [cat]}})
    for match in matches:
        if match not in results:
            results.append(match)
    return results


def readPartialText(ToMatch):
    client = getClient()
    db = client.contentManager
    regex = re.compile(".*{v}.*".format(v=ToMatch))
    resSet = db.content.find({"text": {"$regex": ".*{v}.*".format(v=ToMatch)}})

    results = []
    for res in resSet:
        results.append(res)
    client.close()
    return results

def getSpecificUser(mail):
    client = getClient()
    db = client.contentManager
    res = db.cmKnownUsers.find_one({"email": mail})
    userObject = {"name": res["name"],
                  "email": res["email"],
                  "id": str(res["_id"]),
                  "role": res["role"],
                  "permissions": getUserPermissions(res["role"])}
    client.close()
    return userObject


def getAllUsers():
    client = getClient()
    db = client.contentManager
    resSet = db.cmKnownUsers.find({})
    results = []
    for res in resSet:
        userObject = {"name": res["name"],
                      "email": res["email"],
                      "id": str(res["_id"]),
                      "role": res["role"]}
        results.append(userObject)
    client.close()
    return results


def getPageID(pageName):
    client = getClient()
    db = client.contentManager
    resSet = db.pages.find({"pageName": pageName})
    results = []
    for res in resSet:
        results.append(res)
    client.close()
    if len(results) > 0:
        return str(results[0]["_id"])
    else:
        return 0

def deleteEntry(ID, database):
    if ID == 0:
        return
    client = getClient()
    db = None
    if database == "content":
        db = client.contentManager.content
    else:
        db = client.contentManager.pages
    db.delete_one({"_id": ObjectId(str(ID))})
    client.close()

def authenticateOnExecute(route, token):
    user = checkToken(token)
    perms = getUserPermissions(user["role"])
    if not checkPermission(route, perms):
        message = json.dumps([{"error":
                                  {"type": "permission error",
                                           "request": route,
                                           "necessary": getReqPermission(route),
                                           "your permissions": {"content blocks": perms["permissionContent"],
                                                                "pages": perms["permissionPages"]
                                                               }
                                  }
                              }
                              ], [{"token": str(updateToken(token))}]
                             )
        return message

def insertEntry(data, database):
    client = getClient()
    db = None
    if database == "content":
        db = client.contentManager.content
    else:
        db = client.contentManager.pages
    db.insert_one(data)
    client.close()

def insertPermission(newRole):
    client = getClient()
    db = client.contentManager.permissions
    db.insert_one(newRole)
    client.close()

def getAllRoles():
    client = getClient()
    db = client.contentManager.permissions
    cursor = db.find({})
    result = []
    for res in cursor:
        res["_id"] = str(res["_id"])
        result.append(res)
    client.close()
    return result

def updateUser(ID, data):
    client = getClient()
    db = client.contentManager.cmKnownUsers
    res = db.update_one({"_id": ObjectId(str(ID))}, {"$set": data}, upsert=False)
    client.close()
    return res.modified_count > 0

def deleteRole(role, delUser):
    client = getClient()
    db = client.contentManager.permissions
    db.delete_one({"role": role})
    if delUser:
        db = client.contentManager
        db.cmKnownUsers.delete_many({"role": role})
        db.cmLoggedUsers.delete_many({"role": role})
    client.close()

def updateRole(role):
    roleName = role["role"]
    deleteRole(roleName, False)
    insertPermission(role)


def getPageCategories(ID):
    client = getClient()
    db = client.contentManager
    res = db.pages.find_one({"_id": ObjectId(str(ID))})
    client.close()
    return res["cats"]

def updateUserPW(user, newPW):
    client = getClient()
    db = client.contentManager
    db.cmKnownUsers.find_one_and_update({"email": user}, {"$set":{"pw": str(newPW)}})
    client.close()


def updateEntry(data, database, ID, user):
    client = getClient()
    db = None
    if database == "content":
        db = client.contentManager.content
        #createContentVersion(data, db.find_one({"_id": ObjectId(str(ID))}), user, "change")
    else:
        db = client.contentManager.pages
        #add page version creation
    res = db.update_one({"_id": ObjectId(str(ID))}, data, upsert=False)
    client.close()
    return res.modified_count > 0


def checkToken(token):
    client = getClient()
    db = client.contentManager
    res = db.cmLoggedUsers.find_one({"token": token})
    client.close()
    return res

def getUserPermissions(role):
    client = getClient()
    db = client.contentManager
    res = db.permissions.find_one({"role": role})
    res["_id"] = str(res["_id"])
    client.close()
    return res

def checkPermission(route, perms):
    if "admin" in route:
        return perms["admin"]
    elif route == "/content/create":
        return "c" in perms["permissionContent"]
    elif route == "/content/read/keyword" or route=="/content/read/text":
        return "r" in perms["permissionContent"]
    elif route == "/content/update":
        return "u" in perms["permissionContent"]
    elif route == "/content/delete":
        return "d" in perms["permissionContent"]
    elif route == "/page/create":
        return "c" in perms["permissionPages"]
    elif route == "/page/read":
        return "r" in perms["permissionPages"]
    elif route == "/page/update":
        return "u" in perms["permissionPages"]
    elif route == "/page/delete":
        return "d" in perms["permissionPages"]
    return False

def getReqPermission(route):
    if "admin" in route:
        return "admin=true"
    elif route == "/content/create":
        return "c"
    elif route == "/content/read/keyword" or route=="/content/read/text":
        return "r"
    elif route == "/content/update":
        return "u"
    elif route == "/content/delete":
        return "d"
    elif route == "/page/create":
        return "c"
    elif route == "/page/read":
        return "r"
    elif route == "/page/update":
        return "u"
    elif route == "/page/delete":
        return "d"

def updateToken(token):
    client = getClient()
    db = client.contentManager
    res = db.cmLoggedUsers.find_one({"token": token})
    uName = res["email"]
    randSeed = (uName + ''.join(chr(random.randint(0,255)))).encode("utf-8")
    hasher = sha256()
    hasher.update(randSeed)
    newToken = hasher.hexdigest()
    print("Updated Token : {t}".format(t=str(newToken)))
    db.cmLoggedUsers.find_one_and_update({"email": uName}, {"$set":{"token": str(newToken)}})
    client.close()
    return str(newToken)

def deleteToken(token):
    client = getClient()
    client.cmLoggesUsers.delete_one({"token": token})