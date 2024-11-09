<?php

    include "connection.php";

    $UserId = $_POST['UserId'];
    $category = $_POST['category'];
    $amount = $_POST['amount'];
    $type = $_POST['type'];
    $date = $_POST['date'];
    $notes = $_POST['notes'];

    if (empty($UserId) || empty($category) || empty($amount) || empty($type) || empty($date) || empty($notes)) {
        echo json_encode([
            "status" => "Failed",
            "message" => "All fields are required."
        ]);
        exit();
    }

    try {
        $query = $connection->prepare("INSERT INTO transactions (UserId, category, amount, type, date, notes) VALUES (?, ?, ?, ?, ?, ?)");
        $query->bind_param("isdsss", $UserId, $category, $amount, $type, $date, $notes);
        $query->execute();
        $result = $query->affected_rows;

        if ($result != 0) {
            $transactionId = $connection->insert_id;
            echo json_encode([
                "status" => "Transaction Successful",
                "message" => "Transaction added successfully.",
                "transaction" => [
                    "id" => $transactionId,
                    "category" => $category,
                    "amount" => $amount,
                    "type" => $type,
                    "date" => $date,
                    "notes" => $notes
                ]
            ]);
        } 
        else {
            echo json_encode([
                "status" => "Failed",
                "message" => "Failed to add transaction."
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            "status" => "Failed",
            "message" => "Error: " . $e->getMessage()
        ]);
    }
?>
