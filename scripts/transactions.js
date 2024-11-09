document.addEventListener("DOMContentLoaded", function () {
        
    const UserIdLocalStorage = localStorage.getItem("UserId");

    // initialize
    const categoryInput = document.getElementById("category");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type_of_transaction");
    const dateInput = document.getElementById("date");
    const notesInput = document.getElementById("notes");
    const form = document.getElementById("transactionForm");
    const income_money = document.getElementById("income-money");
    const expense_money = document.getElementById("expense-money");
    const budget_money = document.getElementById("budget-money");
    const add_Transaction = document.getElementById("submitTransaction");

    let totalIncome = 0;
    let totalExpense = 0;

    function updateDisplay() {
        const budget = totalIncome - totalExpense;
        income_money.textContent = Number(totalIncome).toFixed(2);
        expense_money.textContent = Number(totalExpense).toFixed(2);
        budget_money.textContent = Number(budget).toFixed(2);

        // Select the card elements
        const incomeCard = document.querySelector(".income-money").closest(".card");
        const expenseCard = document.querySelector(".expense-money").closest(".card");
        const budgetCard = document.querySelector(".budget-money").closest(".card");

        // Update card background colors based on conditions
        updateBackgroundColor(incomeCard, expenseCard, budgetCard, budget);
    }

    function updateBackgroundColor(incomeCard, expenseCard, budgetCard, budget) {
        const expensePercentage = (Math.abs(totalExpense) / totalIncome) * 100;
        const incomeStatus = totalIncome - Math.abs(totalExpense);

        // Set expense card background color
        if (expensePercentage > 50) {
            expenseCard.style.backgroundColor = "#FFD7D7";
        } else if (expensePercentage > 25) {
            expenseCard.style.backgroundColor = "#ffeacc";
        } else {
            expenseCard.style.backgroundColor = "#d6ffe6";
        }

        // Set income card background color
        if (incomeStatus < 0) {
            incomeCard.style.backgroundColor = "#FFD7D7";
        } else if (incomeStatus < totalIncome * 0.25) {
            incomeCard.style.backgroundColor = "#ffeacc";
        } else {
            incomeCard.style.backgroundColor = "#d6ffe6";
        }

        // Set budget card background color
        if (budget < 0) {
            budgetCard.style.backgroundColor = "#FFD7D7";
        } else if (budget === 0) {
            budgetCard.style.backgroundColor = "#ffeacc";
        } else {
            budgetCard.style.backgroundColor = "#d6ffe6";
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
                    <div class="detail-item">
                        <label>Category: <input type="text" id="edit-category" value="${transaction.category}" disabled></label>
                    </div>
                    <div class="detail-item">
                        <label>Type: <input type="text" id="edit-type" value="${transaction.type}" disabled></label>
                    </div>
                    <div class="detail-item">
                        <label>Amount: <input type="number" id="edit-amount" value="${Math.abs(transaction.amount).toFixed(2)}" disabled></label>
                    </div>
                    <div class="detail-item">
                        <label>Date: <input type="date" id="edit-date" value="${transaction.date}" disabled></label>
                    </div>
                    <div class="detail-item">
                        <label>Notes: <input type="text" id="edit-notes" value="${transaction.notes}" disabled></label>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="edit-transaction" id="edit-transaction">Edit</button>
                    <button class="save-transaction" id="save-transaction" style="display: none;">Save</button>
                    <button id="close-dialog" class="close-dialog">Close</button>
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

        saveButton.addEventListener("click", async(event) => {
            const editedTransaction = {
                TransactionId: transaction.id,
                category: document.getElementById("edit-category").value,
                type: document.getElementById("edit-type").value,
                amount: parseFloat(document.getElementById("edit-amount").value) * (transaction.type === "expense" ? -1 : 1),
                date: document.getElementById("edit-date").value,
                notes: document.getElementById("edit-notes").value,
            };

            try{
                const response = await axios.post("http://localhost:8080/expense-tracker-website/APIs/updateTransaction.php", editedTransaction, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.data.status === "Update Success") {
                    // Update table row after successful database update
                    const tableBody = document.getElementById("table-body");
                    const row = tableBody.querySelector(`tr[data-transaction-id="${transaction.id}"]`);
                    row.cells[0].textContent = editedTransaction.date;
                    row.cells[1].textContent = editedTransaction.category;
                    row.cells[2].textContent = editedTransaction.type;
                    row.cells[3].textContent = Math.abs(editedTransaction.amount).toFixed(2);
                    row.cells[4].textContent = editedTransaction.notes;

                    // Adjust totals for income/expense
                    // subtract before edit
                    if (transaction.type === "income") {
                        totalIncome -= transaction.amount;
                    } 
                    else {
                        totalExpense -= Math.abs(transaction.amount);
                    }

                    // add after edit
                    if (editedTransaction.type === "income") {
                        totalIncome += editedTransaction.amount;
                    } 
                    else {
                        totalExpense += Math.abs(editedTransaction.amount);
                    }
                    updateDisplay();

                    dialog.close();
                    document.body.removeChild(dialog);
                }
                else {
                    //console.log("Failed to update transaction:", response.data.message);
                }
            } 
            catch (error) {
                //console.error("An error occurred while updating the transaction:", error);
            }
        });
    }

    // add transaction
    add_Transaction.addEventListener("click", async(event)=>{
        event.preventDefault();

        // Get values from the form inputs
        const category = categoryInput.value;
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;
        const date = dateInput.value;
        const notes = notesInput.value;

        // check if some values are missing
        if (!category || isNaN(amount) || amount <= 0 || !type || !date || !notes) {
            const message = document.createElement("p");
            message.id = "errorMessage";
            message.className = "txt-red";
            message.textContent = "! Please fill all the form before";
            transactionForm.appendChild(message);
            return;
        } 

        const data = new FormData();

        data.append("UserId",UserIdLocalStorage);
        data.append("category",categoryInput.value);
        data.append("amount",parseFloat(amountInput.value));
        data.append("type", typeInput.value);
        data.append("date", dateInput.value);
        data.append("notes",notesInput.value);

        const response = await axios("http://localhost:8080/expense-tracker-website/APIs/addTransaction.php",{
            method:"POST",
            data:data,
        });
        
        const transaction = response.data.transaction;

        try{   
            if (response.data.status === "Transaction Successful") {
                const transaction = response.data.transaction;
                addTransactionToTable(transaction);
            } else {
                //console.log("Failed");
            }
        }
        catch (error) {
            //console.error("An error occurred:", error);
        }

         // Update total income or expense
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } 
        else {
            totalExpense += Math.abs(transaction.amount);  // Ensure expense is positive
        }

        updateDisplay();

        resetForm();
        
    });

    // Reset the form

    function resetForm() {
        form.reset();
        const existingMessage = document.getElementById("errorMessage");
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    function addTransactionToTable(transaction){
        const tableBody = document.getElementById("table-body");
        const row = document.createElement("tr");
        row.setAttribute("data-transaction-id", transaction.id);

        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.category}</td>
            <td>${transaction.type}</td>
            <td>${Math.abs(transaction.amount).toFixed(2)}</td>
            <td>${transaction.notes}</td>
            <td><button class="bg-red-light delete-transaction">Delete</button></td>
        `;
        tableBody.appendChild(row);

        row.addEventListener("click", () => openDialogTransaction(transaction));

        const deleteButton = row.querySelector(".delete-transaction");
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteTransaction(transaction.id, row);

        });
    }

    // function to delete transaction

    async function deleteTransaction(TransactionId, row){

        try{
            const response = await axios(`http://localhost:8080/expense-tracker-website/APIs/deleteTransaction.php?TransactionId=${TransactionId}`,{
                method:"GET",
            });

            if (response.data.status === "Delete Success"){
                
                const transactionType = row.cells[2]?.textContent || "";
                const transactionAmount = parseFloat(row.cells[3]?.textContent || 0);

                // Update totals
                if (transactionType === "income") {
                    totalIncome -= transactionAmount;
                } 
                else {
                    totalExpense -= Math.abs(transactionAmount);
                }
                updateDisplay();
                
                row.remove();
            } 
            else {
                //console.log("Failed to delete transaction.");
            }

        }
        catch (error) {
            //console.error("An error occurred while deleting the transaction:", error);
        }        
    }

    // Load the transactions of the user
    async function loadTransactions() {
        try{
            const response = await axios(`http://localhost:8080/expense-tracker-website/APIs/loadTransactions.php?UserId=${UserIdLocalStorage}`,{
                method:"GET",
            });

            
            if (response.data.status === "Load transaction successful") {
                const transactions = response.data.transactions;

                const tableBody = document.getElementById("table-body");
                tableBody.innerHTML = "";

                totalIncome = 0;
                totalExpense = 0;

                transactions.forEach(transaction => {
                    addTransactionToTable(transaction);
                    if (transaction.type === 'income') {
                        totalIncome += transaction.amount;
                    } else {
                        totalExpense += Math.abs(transaction.amount);
                    }
                });

                updateDisplay();

            } 
            else {
                //console.log("Failed to load transactions:", response.data.message);
            }
        } 
        catch (error) {
            //console.error("An error occurred while loading transactions:", error);
        }
    }

    
    // filter table

    const apply_filter_by_price = document.getElementById("apply-filter-price");
    const apply_filter_by_type = document.getElementById("apply-filter-type");
    const apply_filter_by_date = document.getElementById("apply-filter-date");
    const apply_filter_by_notes = document.getElementById("apply-filter-notes");
    const apply_filter_all = document.getElementById("apply-filter-all");
    apply_filter_by_price.addEventListener("click", filterByPrice);
    apply_filter_by_type.addEventListener("click", filterByType);
    apply_filter_by_date.addEventListener("click", filterByDate);
    apply_filter_by_notes.addEventListener("click", filterByNotes);
    apply_filter_all.addEventListener("click", filterByAll);

    function filterByAll(){
        filterByPrice();
        filterByType();
        filterByDate();
        filterByType();
        filterByNotes();
    }

    // Function to filter transactions by price
    function filterByPrice() {
        const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
        const maxPrice = parseFloat(document.getElementById("max-price").value) || Infinity;
        const transactions = document.querySelectorAll("#table-body tr");
    
        transactions.forEach(transaction => {
            const transactionPrice = parseFloat(transaction.cells[3]?.textContent || 0);
            if (transactionPrice >= minPrice && transactionPrice <= maxPrice) {
                transaction.style.display = "";
            }
            else {
                transaction.style.display = "none";
            }

        });
    }

    // Function to filter transactions by type
    function filterByType() {
        const type = document.getElementById("type-filter").value; // Get the selected type
        const transactions = document.querySelectorAll("#table-body tr");
        
        transactions.forEach(transaction => {
            const transactionType = transaction.cells[2]?.textContent || "";
            if (!type || transactionType.toLowerCase() === type.toLowerCase()) {
                transaction.style.display = "";
            } else {
                transaction.style.display = "none";
            }
        });
    }

    // Function to filter transactions by date
    function filterByDate() {
        const date = document.getElementById("date-filter").value;
        const transactions = document.querySelectorAll("#table-body tr");
    
        transactions.forEach(transaction => {
            const transactionDate = transaction.cells[0]?.textContent || "";
            if (!date || transactionDate === date) {
                transaction.style.display = "";
            } else {
                transaction.style.display = "none";
            }
        });
    }
    
    // Function to filter transactions by notes
    function filterByNotes() {
        const notes = document.getElementById("notes-filter").value.toLowerCase();
        const transactions = document.querySelectorAll("#table-body tr");
    
        transactions.forEach(transaction => {
            const transactionNotes = transaction.cells[4]?.textContent || "";
            if (!notes || transactionNotes.includes(notes)) {
                transaction.style.display = "";
            } else {
                transaction.style.display = "none";
            }
        });
    }

    loadTransactions();
});