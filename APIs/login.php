<?php

include "connection.php";

$username = $_POST["username"];
$email = $_POST["email"];
$password = $_POST["password"];

$query = $connection->prepare("SELECT * FROM users WHERE username = ? and email = ?");
$query->bind_param("ss", $username, $email);
$query->execute();
$result = $query->get_result();

if ($result->num_rows != 0) {
    $user = $result->fetch_assoc();

    // Verify password
    $check = password_verify($password, hash: $user["password"]);

    if ($check) {
        echo json_encode([
            "status" => "Login Succesful",
            "UserId" => $user["UserId"], 
        ]);
    } else {
        echo json_encode([
            "status" => "Invalid Credentials",
        ]);
    }
} else {
    echo json_encode([
        "status" => "Invalid Credentials",
    ]);
}

?>