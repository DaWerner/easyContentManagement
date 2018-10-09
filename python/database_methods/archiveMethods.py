import pymongo
import json
from bson import ObjectId

def getPageClient():
    return pymongo.MongoClient("localhost:27017").contentManager.pageArchive

def getContentClient():
    return pymongo.MongoClient("localhost:27017").contentManager.contentArchive

def createContentVersion(new, document, user, type):
    client = getContentClient()
    document["_id"] = str(document["_id"])
    origID = str(document.pop("_id", None))
    archDoc = {"newDoc": new, "archDoc": document, "user": user, "opType": type, "origID": origID}
    older = _checkOlderUnstagedContent(user, origID)
    print(archDoc)
    if older is None:
        client.insert_one(archDoc)
    else:
        client.update_one({"_id": older["_id"]}, {"$set": {"newDoc": new}})


def _checkOlderUnstagedContent(user, ID):
    client = getContentClient()
    res = client.find_one({"origID": ID, "user": user})
    return res

def createPageVersion(new, document, user, type):
    client = getPageClient()
    print(document)
    print(new)
    document["_id"] = str(document["_id"])
    origID = str(document.pop("_id", None))
    archDoc = {"newDoc": new, "archDoc": document, "user": user, "opType": type, "origID": origID}
    older = _checkOlderUnstagedPage(user, origID)
    print(archDoc)
    if older is None:
        client.insert_one(archDoc)
    else:
        client.update_one({"_id": older["_id"]}, {"$set": {"newDoc": new}})


def _checkOlderUnstagedPage(user, ID):
    client = getPageClient()
    res = client.find_one({"origID": ID, "user": user})
    return res