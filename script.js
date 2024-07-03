document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    loadBudgets();
    initializeIncomeStatement(); // Initialize income statement with initial salary
});

document.getElementById('transaction-form').addEventListener('submit', addTransaction);
document.getElementById('budget-form').addEventListener('submit', addBudget);

function addTransaction(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value); // Convert to number
    const category = document.getElementById('category').value;

    // Add transaction to server
    fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, description, amount, category })
    })
    .then(response => response.json())
    .then(data => {
        alert('Transaction added');
        loadTransactions();
        updateIncomeStatement(date, amount, category); // Update income statement after adding transaction
    })
    .catch(error => console.error('Error:', error));
}

function loadTransactions() {
    fetch('http://localhost:5000/transactions')
    .then(response => response.json())
    .then(transactions => {
        const tbody = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        transactions.forEach(transaction => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = transaction.date;
            row.insertCell(1).innerText = transaction.description;
            row.insertCell(2).innerText = transaction.amount.toFixed(2); // Format amount
            row.insertCell(3).innerText = transaction.category;
            const actionsCell = row.insertCell(4);
            actionsCell.innerHTML = `<button onclick="editTransaction('${transaction._id}')">Edit</button> <button onclick="deleteTransaction('${transaction._id}')">Delete</button>`;
        });
    });
}

function deleteTransaction(id) {
    fetch(`http://localhost:5000/transactions/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert('Transaction deleted');
        loadTransactions();
        updateIncomeStatement(data.date, -data.amount, data.category); // Update income statement after deleting transaction
    })
    .catch(error => console.error('Error:', error));
}

function addBudget(event) {
    event.preventDefault();

    const category = document.getElementById('budget-category').value;
    const allocatedAmount = parseFloat(document.getElementById('allocated-amount').value); // Convert to number
    const actualAmount = parseFloat(document.getElementById('actual-amount').value); // Convert to number

    // Add budget to server
    fetch('http://localhost:5000/budgets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, allocatedAmount, actualAmount })
    })
    .then(response => response.json())
    .then(data => {
        alert('Budget added');
        loadBudgets();
    })
    .catch(error => console.error('Error:', error));
}

function loadBudgets() {
    fetch('http://localhost:5000/budgets')
    .then(response => response.json())
    .then(budgets => {
        const tbody = document.getElementById('budgets-table').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        budgets.forEach(budget => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = budget.category;
            row.insertCell(1).innerText = budget.allocatedAmount.toFixed(2); // Format amount
            row.insertCell(2).innerText = budget.actualAmount.toFixed(2); // Format amount
            const actionsCell = row.insertCell(3);
            actionsCell.innerHTML = `<button onclick="editBudget('${budget._id}')">Edit</button> <button onclick="deleteBudget('${budget._id}')">Delete</button>`;
        });
    });
}

function editBudget(id) {
    fetch(`http://localhost:5000/budgets/${id}`)
    .then(response => response.json())
    .then(budget => {
        // Populate form fields with current budget data
        document.getElementById('budget-category').value = budget.category;
        document.getElementById('allocated-amount').value = budget.allocatedAmount;
        document.getElementById('actual-amount').value = budget.actualAmount;

        // Change submit button behavior to update the budget
        const submitButton = document.querySelector('#budget-form button[type="submit"]');
        submitButton.innerText = 'Update Budget';
        submitButton.onclick = function(event) {
            event.preventDefault();

            // Retrieve updated values from form
            const updatedCategory = document.getElementById('budget-category').value;
            const updatedAllocatedAmount = parseFloat(document.getElementById('allocated-amount').value); // Convert to number
            const updatedActualAmount = parseFloat(document.getElementById('actual-amount').value); // Convert to number

            // Send PUT request to update budget
            fetch(`http://localhost:5000/budgets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category: updatedCategory,
                    allocatedAmount: updatedAllocatedAmount,
                    actualAmount: updatedActualAmount
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Budget updated');
                loadBudgets(); // Reload budgets table
                submitButton.innerText = 'Add Budget'; // Reset button text
                submitButton.onclick = addBudget; // Reset button click handler
                document.getElementById('budget-form').reset(); // Reset form fields
            })
            .catch(error => console.error('Error:', error));
        };
    })
    .catch(error => console.error('Error:', error));
}

function deleteBudget(id) {
    fetch(`http://localhost:5000/budgets/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert('Budget deleted');
        loadBudgets();
    })
    .catch(error => console.error('Error:', error));
}

function initializeIncomeStatement() {
    const initialSalary = 50000; // Initial salary amount
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const incomeStatementTable = document.getElementById('income-statement-table-body');

    months.forEach(month => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td id="income-${month.toLowerCase()}">${initialSalary.toFixed(2)}</td>
            <td id="expenses-${month.toLowerCase()}">0.00</td>
            <td id="netIncome-${month.toLowerCase()}">${initialSalary.toFixed(2)}</td>
        `;
        incomeStatementTable.appendChild(row);
    });
}

function updateIncomeStatement(date, amount, category) {
    const incomeStatementTable = document.getElementById('income-statement-table-body');
    const month = getMonthFromDate(date);

    // Find the row for the specific month
    const row = incomeStatementTable.querySelector(`tr:nth-child(${month.index + 1})`);

    if (!row) {
        console.error(`Month row not found for ${month.name}`);
        return;
    }

    // Update income, expenses, and net income cells
    const incomeCell = row.querySelector(`#income-${month.name.toLowerCase()}`);
    const expensesCell = row.querySelector(`#expenses-${month.name.toLowerCase()}`);
    const netIncomeCell = row.querySelector(`#netIncome-${month.name.toLowerCase()}`);

    let currentIncome = parseFloat(incomeCell.innerText);
    let currentExpenses = parseFloat(expensesCell.innerText);
    let currentNetIncome = parseFloat(netIncomeCell.innerText);

    // Update expenses and net income cells
    currentExpenses += Math.abs(amount); // Use absolute value for expenses
    currentNetIncome -= Math.abs(amount); // Deduct transaction amount from net income

    expensesCell.innerText = currentExpenses.toFixed(2);
    netIncomeCell.innerText = currentNetIncome.toFixed(2);

    // Function to get month index and name from date
    function getMonthFromDate(dateString) {
        const date = new Date(dateString);
        const monthIndex = date.getMonth();
        const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
        return { index: monthIndex, name: monthName };
    }
}
