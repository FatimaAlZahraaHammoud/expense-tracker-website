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

    // if add and cancel button is clicked
    add_Transaction.addEventListener("click", addTransaction);
    cancel_Transaction.addEventListener("click", resetForm);

    // check for transactions in local storage

    if(!localStorage.getItem("transactions")){
        localStorage.setItem("transactions", JSON.stringify([]));

    }

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let transactionCounter = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    // add transactions

    function addTransaction(){

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

        const transaction = {
            id: transactionCounter++,
            category,
            amount: type === "income" ? amount : -amount,
            type,
            date,
            notes
        };

        // track income and expense
        if (type === "income") {
            totalIncome += amount;        
        } 
        else {
            totalExpenses += amount;
        }

        // add the transaction to the local storage
        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // add the transaction to the table
        addTransactionToTable(transaction);

        // Reset the form
        resetForm();
    }

    // Reset the form

    function resetForm() {
        transactionForm.reset();
        const existingMessage = document.getElementById("errorMessage");
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // open dialog
    function openDialogTransaction(transaction){
        const dialog = document.createElement("dialog");
        dialog.className = "transaction-dialog";
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Transaction Details</h3>
                <div class="transaction-details">
                    <label>Category: <input type="text" id="edit-category" value="${transaction.category}" disabled></label>
                    <label>Type: <input type="text" id="edit-type" value="${transaction.type}" disabled></label>
                    <label>Amount: <input type="number" id="edit-amount" value="${Math.abs(transaction.amount).toFixed(2)}" disabled></label>
                    <label>Date: <input type="date" id="edit-date" value="${transaction.date}" disabled></label>
                    <label>Notes: <input type="text" id="edit-notes" value="${transaction.notes}" disabled></label>
                </div>
                <div class="dialog-buttons">
                    <button class="edit-transaction" id="edit-transaction">Edit</button>
                    <button class="save-transaction" id="save-transaction" style="display: none;">Save</button>
                    <button id="close-dialog">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        dialog.showModal();

        const editButton = document.getElementById("edit-transaction");
        const saveButton = document.getElementById("save-transaction");
        const closeButton = document.getElementById("close-dialog");

        // edit the dialog

        editButton.addEventListener("click", () => {
            dialog.querySelectorAll(".transaction-details input").forEach(input => input.disabled = false);
            editButton.style.display = "none";
            saveButton.style.display = "inline";
        });

        // close the dialog
        closeButton.addEventListener("click", () =>{
            dialog.close();
            document.body.removeChild(dialog);
        });

        saveButton.addEventListener("click", () => {
            const editedTransaction = {
                id: transaction.id,
                category: document.getElementById("edit-category").value,
                type: document.getElementById("edit-type").value,
                amount: parseFloat(document.getElementById("edit-amount").value) * (transaction.type === "expense" ? -1 : 1),
                date: document.getElementById("edit-date").value,
                notes: document.getElementById("edit-notes").value,
            };

            console.log("Edited Transaction:", editedTransaction);


            // Update transaction in localStorage
            const index = transactions.findIndex(t => t.id === transaction.id);
            transactions[index] = editedTransaction;
            localStorage.setItem("transactions", JSON.stringify(transactions));

            // Update table row
            const row = table_body.querySelector(`tr[data-transaction-id="${transaction.id}"]`);
            row.cells[0].textContent = editedTransaction.date;
            row.cells[1].textContent = editedTransaction.category;
            row.cells[2].textContent = editedTransaction.type;
            row.cells[3].textContent = Math.abs(editedTransaction.amount).toFixed(2);
            row.cells[4].textContent = editedTransaction.notes;

            dialog.close();
            document.body.removeChild(dialog);
        });
    }

    // function to add transaction to table:

    function addTransactionToTable(transaction){
        const row = document.createElement("tr");
            row.setAttribute("data-transaction-id", transaction.id);
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.category}</td>
                <td>${transaction.type}</td>
                <td>${Math.abs(transaction.amount).toFixed(2)}</td>
                <td>${transaction.notes}</td>
                <td><button class="delete-transaction" id="delete-transaction">Delete</button></td>
            `;
            table_body.appendChild(row);

            row.addEventListener("click", () => openDialogTransaction(transaction));
            document.getElementById("delete-transaction").addEventListener("click", (event) => {
                //event.stopPropagation();  // Prevent the row click event
                deleteTransaction(transaction.id);
            });
    }

    // load transactions on page load
    function loadTransactions() {
        transactions.forEach(transaction => {
            addTransactionToTable(transaction);
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