## **Release Notes 0.1.2 Beta**
**Textblöcke**
Textblöcke können:
 - angelegt werden
 - gelöscht werden
 - in einem wysiwyg Editor bearbeitet
 - nach Text oder Keywords gesucht werden
 - gelesen werden


**Seiten**
Seiten können
 - angelegt werden
 - gelöscht werden
 - verändert werden
 - gelesen werden
 - Textblöcke auf seiten lassen sich in einem wysiwyg Editor bearbeiten
 - Textblöcke auf seiten lassen sich nach oben und unten verschieben
 - Branche und Rubrik können beim absenden einer neuen Page festgelegt werden 
 - Seiten sind als drittes Navigationslevel integriert
 - Clipboard wurde entfernt und Global durch die Suche erstzt deren ihalte jetzt dropbar sind


**Kategorien**
Bestehende Kategorien können ausgelesen und Angelegt werden.

**Administration**
- Neue Rollen können angelegt werden
- User können angelegt werden
- User Rollen können verändert werden
- Create, Read, Update, Delete Rechte können für Textblöcke und Pages vergeben werden
- Adminpanel ist für Admins über den neuen Profil bereich erreichbar
- User Passwörter können im Profilbereich via "Change Password" geändert werden


Bekannte Probleme:
- User können über das UI nicht gelöscht werden (Es kann jedoch eine Rolle ohne jegliche Rechte vergeben werden)
- Rollen können über das UI nicht entfernt werden
- Content Administration muss noch implementiert werden (Versionierung, Block für bestimmte Rollen usw.)


## **Release Notes 0.1.1 Beta**
**Textblöcke**
Textblöcke können:
 - angelegt werden
 - gelöscht werden
 - in einem wysiwyg Editor bearbeitet
 - nach Text oder Keywords gesucht werden
 - gelesen werden

 Bekannte Probleme:
 Keine

**Seiten**
Seiten können
- angelegt werden
- gelöscht werden
- verändert werden
- gelesen werden
- Textblöcke auf seiten lassen sich in einem wysiwyg Editor bearbeiten
- Textblöcke auf seiten lassen sich nach oben und unten verschieben
Bekannte Probleme:
- Modal Dialog vor dem absenden zeigt Kategorien und Branche in Input, habe noch aber keine Ahnung wie wir das in nen multiselect bekommen
- Seiten sollen von den Tabs in die Navigation umziehen
- Clipboard soll auf den Seiten durch eine Suche ersetzt werden


**Kategorien**
- Bestehende Kategorien können ausgelesen werden.

Bekannte Probleme:
- Neue Kategorien sollen für eine Branche hinzugefügt werden können

**Administration**
- Neue Rollen können angelegt werden
- User können angelegt werden
- User Rollen können verändert werden
- Create, Read, Update, Delete Rechte können für Textblöcke und Pages vergeben werden

Bekannte Probleme:
- User können über das UI nicht gelöscht werden (Es kann jedoch eine Rolle ohne jegliche Rechte vergeben werden)
- Rollen können über das UI nicht entfernt werden
- Content Administration muss noch implementiert werden (Versionierung, Block für bestimmte Rollen usw.)
- Adminpanel muss noch über die URL aufgerufen werden, es gibt noch keinen Link
- Userpasswörter können nach der Erstellung noch nicht geändert werden (Wird Anfang KW 33 2018 via Hotfix implementiert)
- Create User Dialog liest noch nicht alle (Kommt auch Anfang KW 33)
