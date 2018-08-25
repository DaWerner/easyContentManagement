<?php

$Name = urldecode($_POST["name"]);
$Email = urldecode($_POST["email"]);
$PW = urldecode($_POST["pw"]);
$Role = urldecode($_POST["role"]);
$Client = new MongoDB\Driver\Manager("mongodb://localhost:27017");

$ToWrite = ["email"=>$Email, "role"=>$Role, "pw"=>$PW, "name"=>$Name];
$Filter = ["email"=>$Email];
if(queryDB($Client, $Filter, "contentManager.cmKnownUsers") ===[]){
    writeToDB($Client, $ToWrite, "contentManager.cmKnownUsers");
    echo "OK";
}else{
    http_response_code(400);
    echo "Not unique Identifier";
}



function writeToDB($Client, $ToWrite, $DB){
        $ChangeValue = new MongoDB\Driver\BulkWrite;
        $ChangeValue->insert($ToWrite);
        $Client->executeBulkWrite($DB, $ChangeValue);

}


function queryDB($Client, $Filter, $DB) {
    $getQuery = new MongoDB\Driver\Query($Filter);
    $result = $Client->executeQuery($DB, $getQuery);
    $Data = [];
    foreach ($result as $res) {
        $Data["email"] = $res->email;
        break;
    }
    return $Data;
}