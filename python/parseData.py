import xml.etree.ElementTree as ET
import json
import os
import sys
import pymongo

branch = "MedicalProfession"
lang = "_de_DE"
datapath = "/home/daniel/Documents/{b}{l}/".format(b=branch, l=lang)
extends = ["keywords", "pages", "sitetrees"]
filters = {}

keywords = {}
paragraphs = {}
categories = {}
pages = {}
CurrentFile = None

def showChildren( file, root, level):
    for child in root:
        if(child.tag == "ParagraphFilter"):
            keyId = child.find("./keywordId").text
            parId = child.find("./paragraphId").text
            if parId not in filters:
                filters[parId] = []
            filters[parId].append(keyId)
        if(child.tag == "Description_x0020_Keywords_x0020_Entry"):
            keyId = child.find("./ID").text
            entry = child.find("./Entry").text
            cat = CurrentFile.find(".//CategoryId").text
            keywords[keyId] = {"text": entry, "category": cat}
        if(child.tag == "Paragraphs"):
            parId = child.find("./ID").text
            if child.find("./Content") == None:
                return
            content = child.find("./Content").text
            paragraphs[parId] = content
        if(child.tag == "Query_x0020_Categories"):
            catId = child.find("./ID").text
            catVal = child.find("./Title").text
            categories[catId] = catVal
        if(child.tag == "Pages"):
            pageTitle = child.find("./Title").text
            paras = [x.text for x in child.findall("./Paragraphs/ID") if x is not None]
            pages[pageTitle] = paras
        if(len(child) > 0 ):
            showChildren(file, child, level+1)




for ext in extends:
    rootPath = datapath + ext
    for path, dir, files in os.walk(rootPath):
        for file in files:
            dataRaw = ET.parse("{r}/{f}".format(r=rootPath, f=file))
            dataroot = dataRaw.getroot()
            CurrentFile = dataroot.find("./*")
            showChildren(file, dataroot, 0)
    #print("{r}/{f}".format(r=datapath, f="categories.xml"))
    dataRaw = ET.parse("{r}{f}".format(r=datapath, f="categories.xml"))
    dataroot = dataRaw.getroot()
    CurrentFile = dataroot.find("./*")
    showChildren(file, dataroot, 0)


count = 0
result = {}
for f in filters:
    pId = f
    try:
        pVal = paragraphs[f]
        kIds = filters[f]
    except:
        pVal = "No match for " + f
        kIds = []
    kCats = []
    kVals = []
    for k in kIds:
        if k in keywords:
            if keywords[k]["text"] not in kVals:
                if "," not in keywords[k]["text"]:
                    kVals.append(keywords[k]["text"].replace(" ", ""))
                else:
                    for e in keywords[k]["text"].split(","):
                        kVals.append(e.replace(" ", ""))
                if keywords[k]["category"] in categories:
                    kCats.append(categories[keywords[k]["category"]])
                else:
                    kCats.append("other")
        else:
            kVals.append("other")
    if "other" not in kCats:
        kCats.append("other")
    result[f] = {"text": pVal,
                 "keywords": kVals,
                 "categories": kCats,
                 "branch": branch}

client = pymongo.MongoClient('localhost:27017')
db = client.contentManager
pageObjects = []
for page in pages:
    pO = {}
    pO["pageName"] = page.replace(" ", "_")
    pO["branch"] = branch
    pO["clipboard"] = []
    pO["paragraphs"] = []
    pO["cats"] = []
    for val in pages[page]:
        if val in paragraphs:
            pO["clipboard"].append(paragraphs[val])
            pO["paragraphs"].append(paragraphs[val])
            if val in result:
                pO["cats"] = list(set(pO["cats"] + result[val]["categories"]))
                print(result[val]["categories"])
            else:
                pO["cats"].append("other") if "other" not in pO["cats"] else 1+1
        else:
            pO["clipboard"].append("<div>No match for {v}</div>".format(v=val))
            pO["paragraphs"].append("<div>No match for {v}</div>".format(v=val))
    pageObjects.append(pO)

#for entry in result:
#    print(json.dumps(result[entry], ensure_ascii=False))
#    db.content.insert_one(result[entry])


for entry in pageObjects:
    print(json.dumps(entry, ensure_ascii=False))
    db.pages.insert_one(entry)


