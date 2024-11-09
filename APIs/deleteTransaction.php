<?php

    include "connection.php";

    if(isset($_GET["TransactionId"])){
        $transactionId = $_GET["TransactionId"];

        $query = $connection->prepare("Delete from transactions where TransactionId= ?");
        $query->bind_param("i", $transactionId);
        $query->execute();
        $result = $query->affected_rows;

        if ($result > 0){
            echo json_encode([
                "status"=> "Delete Success",
                "message"=> "transaction deleted successfully"
            ]);
        }
        else {
            echo json_encode([
                "status" => "Failed",
                "message" => "No transaction found with this id"
            ]);
        }
    }
    else{
        echo json_encode([
            "status" => "Failed",
            "message" => "TransactionId is required"
        ]);
    }

    
?>
