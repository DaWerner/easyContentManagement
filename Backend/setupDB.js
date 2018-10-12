use contentManager
db.createCollection("content");
db.createCollection("pages");
db.createCollection("cmLoggeduser")
db.createCollection("cmKnownUser")
db.createCollection("permissions")
db.permissions.insert({"role" : "admin", "permissionContent" : "crud", "permissionPages" : "crud", "admin" : true })
db.cmKnownUser.insert({"name" : "Test Admin", "email" : "admin@admin.com", "role" : "admin", "pw" : "f89edc688a7886e8288fa20ce1baaacb421bf047bdd8fe1d5f0c6c68d7930fd6" })
