const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }
});

const budgetSchema = new mongoose.Schema({
    category: { type: String, required: true },
    allocatedAmount: { type: Number, required: true },
    actualAmount: { type: Number, required: true }
});

const incomeStatementSchema = new mongoose.Schema({
    month: { type: String, required: true },
    income: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 }
}, { collection: 'incomeStatements' });

const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const IncomeStatement = mongoose.model('IncomeStatement', incomeStatementSchema);

module.exports = {
    Transaction,
    Budget,
    IncomeStatement
};
