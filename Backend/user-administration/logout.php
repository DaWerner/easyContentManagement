<?php
$Token = $_POST["token"];
$Client = new MongoDB\Driver\Manager("mongodb://localhost:27017");
$ChangeValue = new MongoDB\Driver\BulkWrite;
$ToDelete = ["token" => $Token];
$ChangeValue->delete($ToDelete);
$Client->executeBulkWrite("contentManager.cmLoggedUsers", $ChangeValue);

