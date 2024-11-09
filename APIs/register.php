<?php
    include "connection.php";

    $username = $_POST["username"];
    $email = $_POST["email"];
    $password = $_POST["password"];

    $hashed = password_hash($password, PASSWORD_BCRYPT);

    $query = $connection->prepare("INSERT INTO users(username, email, password) values(?,?,?)");
    $query->bind_param("sss", $username, $email, $hashed);
    $query->execute();
    $result = $query->affected_rows;

    if ($result!=0){
        echo json_encode([
            "status"=> "Register successful",
            "message"=> "$result user(s) created",
        ]);
    }
    else{
        echo json_encode([
            "status"=> "Failed",
            "message"=> "Could not create record",
        ]);
    }
?>