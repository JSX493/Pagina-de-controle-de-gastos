const balanceDisplay = document.getElementById('balance');
const incomeTotalDisplay = document.getElementById('income-total');
const expenseTotalDisplay = document.getElementById('expense-total');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionsList = document.getElementById('transactions-list');
const filterCategorySelect = document.getElementById('filter-category');

// Mensagens de erro
const descriptionError = document.getElementById('description-error');
const amountError = document.getElementById('amount-error');
const categoryError = document.getElementById('category-error');

// Carregar transações do localStorage ou iniciar com um array vazio
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentFilterCategory = 'all';

// Função para formatar moeda
function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Função para atualizar o saldo e o histórico
function updateUI() {
    // Filtrar transações com base na categoria selecionada
    const filteredTransactions = currentFilterCategory === 'all'
        ? transactions
        : transactions.filter(t => t.category === currentFilterCategory);

    // Calcular o saldo total, receitas e despesas
    const totalBalance = filteredTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const income = filteredTransactions
        .filter(transaction => transaction.amount > 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
    const expense = filteredTransactions
        .filter(transaction => transaction.amount < 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);

    balanceDisplay.textContent = formatCurrency(totalBalance);
    balanceDisplay.classList.toggle('negative', totalBalance < 0); // Adiciona/remove classe para cor
    incomeTotalDisplay.textContent = formatCurrency(income);
    expenseTotalDisplay.textContent = formatCurrency(Math.abs(expense)); // Exibe despesa como valor positivo

    // Limpar o histórico antes de renderizar novamente
    transactionsList.innerHTML = '';

    // Adicionar transações ao histórico
    if (filteredTransactions.length === 0) {
        const noTransactionsMessage = document.createElement('li');
        noTransactionsMessage.textContent = 'Nenhuma transação encontrada para esta categoria.';
        noTransactionsMessage.style.textAlign = 'center';
        noTransactionsMessage.style.color = '#777';
        noTransactionsMessage.style.padding = '20px';
        transactionsList.appendChild(noTransactionsMessage);
    } else {
        filteredTransactions.forEach(transaction => {
            const listItem = document.createElement('li');
            const transactionClass = transaction.amount < 0 ? 'minus' : 'plus';

            listItem.classList.add(transactionClass);
            listItem.innerHTML = `
                <div class="transaction-details">
                    <span class="transaction-description">${transaction.description}</span>
                    <span class="transaction-category">${transaction.category}</span>
                </div>
                <span class="transaction-amount">${formatCurrency(transaction.amount)}</span>
                <button onclick="deleteTransaction(${transaction.id})">x</button>
            `;
            transactionsList.appendChild(listItem);
        });
    }

    // Salvar transações no localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Função para validar formulário
function validateForm(description, amount, category) {
    let isValid = true;

    // Limpar mensagens de erro anteriores
    descriptionError.textContent = '';
    amountError.textContent = '';
    categoryError.textContent = '';

    if (description.trim() === '') {
        descriptionError.textContent = 'A descrição não pode ser vazia.';
        isValid = false;
    }

    if (isNaN(amount) || amount === 0) {
        amountError.textContent = 'O valor deve ser um número diferente de zero.';
        isValid = false;
    }

    if (category === '') {
        categoryError.textContent = 'Por favor, selecione uma categoria.';
        isValid = false;
    }

    return isValid;
}

// Função para adicionar uma nova transação
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!validateForm(description, amount, category)) {
        return; // Sai da função se a validação falhar
    }

    const newTransaction = {
        id: generateID(), // Gera um ID único
        description,
        amount,
        category
    };

    transactions.push(newTransaction);
    updateUI(); // Atualiza a interface

    // Limpa os campos do formulário
    descriptionInput.value = '';
    amountInput.value = '';
    categoryInput.value = ''; // Reseta a seleção da categoria
});

// Função para gerar um ID único (simples para este exemplo)
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Função para deletar uma transação
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateUI(); // Atualiza a interface
}

// Event listener para o filtro de categoria
filterCategorySelect.addEventListener('change', (e) => {
    currentFilterCategory = e.target.value;
    updateUI(); // Atualiza a interface com o novo filtro
});

// Inicializar a aplicação ao carregar a página
updateUI();