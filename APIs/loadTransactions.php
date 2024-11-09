<?php

    include "connection.php";

    $UserId = $_GET["UserId"];

    $query = $connection->prepare("SELECT TransactionId as id, date, category, type, amount, notes FROM transactions WHERE UserId = ?");
    $query->bind_param("i", $UserId);
    $query->execute();
    $result = $query->get_result();

    $transactions = [];
    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }

    if ($result->num_rows >0) {
        echo json_encode([
            "status"=> "Load transaction successful",
            "message"=> "transactions are successfully loaded ",
            "transactions" => $transactions
        ]);
    } 
    else {
        echo json_encode([
            "status"=> "Failed",
            "message"=> "Could not load transactions",
        ]);
    }
?>