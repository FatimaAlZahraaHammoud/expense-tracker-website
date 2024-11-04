document.addEventListener("DOMContentLoaded", function () {

    // initialize elements

    const income_money = document.getElementById("income-money");
    const expense_money = document.getElementById("expense-money");
    const balance_money = document.getElementById("balance-money");
    const table_body = document.getElementById("table-body");
    const transactionForm = document.getElementById("transactionForm");
    const add_Transaction = document.getElementById("submitTransaction");
    const cancel_Transaction = document.getElementById("cancelTransaction");

    // track the income and expense
    let totalIncome = 0;
    let totalExpenses = 0;

    // if add button is clicked
    add_Transaction.addEventListener("click", addTransaction);

    // if cancel button is clicked
    cancel_Transaction.addEventListener("click", () =>{
        transactionForm.reset();
        const existingMessage = document.getElementById("errorMessage");
        if (existingMessage) {
            existingMessage.remove();
        }
    });

    // check for transactions in local storage

    if(!localStorage.getItem("transactions")){
        localStorage.setItem("transactions", JSON.stringify([]));

    }

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // add transactions

    function addTransaction(){

        // remove the error message
        const existingMessage = document.getElementById("errorMessage");
        if (existingMessage) {
            existingMessage.remove();
        }

        // get values from the form
        const category = document.getElementById("category").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;
        const notes = document.getElementById("notes").value;

        // check if some values are missing
        if (!category || isNaN(amount) || amount <= 0 || !type || !date || !notes) {
            const message = document.createElement("p");
            message.id = "errorMessage";
            message.className = "txt-red";
            message.textContent = "! Please fill all the form before";
            transactionForm.appendChild(message);
            return;
        }

        // track income and expense
        if (type === "income") {
            totalIncome += amount;
            transactions.push({ category, amount, type, date, notes }); 
        } 
        else {
            totalExpenses += amount;
            transactions.push({ category, amount: -amount, type, date, notes }); 
        }

        // add the transaction to the local storage
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // add the transaction to the table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${date}</td>
            <td>${category}</td>
            <td>${type}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${notes}</td>
        `;

        table_body.appendChild(row);

        // Reset the form
        transactionForm.reset();

    }

    // load transactions on page load
    function loadTransactions() {
        transactions.forEach(transaction => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.category}</td>
                <td>${transaction.type}</td>
                <td>${Math.abs(transaction.amount).toFixed(2)}</td>
                <td>${transaction.notes}</td>
            `;
            table_body.appendChild(row);

            // Update totals
            if (transaction.type === "income") {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });
    }

    loadTransactions();
});