<?php

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Origin: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET");

    $host = "localhost";
    $dbuser ="root";
    $pass="";
    $dbname="expense-tracker-db";

    $connection = new mysqli($host, $dbuser, $pass, $dbname);

    if ($connection->connect_error){
        die("Connection falied:".$connection->connect_error);
    }
?>