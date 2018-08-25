<?php

$User = urldecode($_POST["user"]);
$PW = $_POST["pw"];
$Client = new MongoDB\Driver\Manager("mongodb://localhost:27017");
$Filter = ["email" => $User, "pw" => $PW];
$Result = queryDB($Client, $Filter, "contentManager.cmKnownUsers");
echo checkInUser($Client, $Result);

function checkInUser($Client, $Result) {
    if ($Result === []) {
        http_response_code(400);
        return "-1";
    } else {
        $AlreadyLoggedin = queryDB($Client, ["email" => $Result["email"]], "contentManager.cmLoggedUsers");
        if ($AlreadyLoggedin !== []) {
            return $AlreadyLoggedin["token"];
        }
        $AuthToken = hash("sha256", $Result["email"] . random_bytes(50));
        $ChangeValue = new MongoDB\Driver\BulkWrite;
        $ToWrite = ["email" => $Result["email"], "token" => $AuthToken, "role" => $Result["role"]];
        $ChangeValue->insert($ToWrite);
        $Client->executeBulkWrite("contentManager.cmLoggedUsers", $ChangeValue);
        return $AuthToken;
    }
}

function queryDB($Client, $Filter, $DB) {
    $getQuery = new MongoDB\Driver\Query($Filter);
    $result = $Client->executeQuery($DB, $getQuery);
    $Data = [];
    foreach ($result as $res) {
        $Data["email"] = $res->email;
        $Data["role"] = $res->role;
        $Data["token"] = $res->token;
        break;
    }
    return $Data;
}
