const fetchBudget = async (username) => {
    const response = await fetch(`/budget/${username}`);
    return await response.json();
};

const addBudgetItem = async (username, item) => {
    const response = await fetch(`/budget/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    return await response.json();
};

const deleteBudgetItem = async (username, itemId) => {
    const response = await fetch(`/budget/${username}/${itemId}`, {
        method: "DELETE",
    });
    return await response.json();
};

function BudgetApp(){
    const [username, setUsername] = React.useState("");
    const [items, setItems] = React.useState([]);
    const [name, setName] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [kind, setKind] = React.useState("expense");

    const handleUpdateUsername = (evt) => {
        setUsername(evt.target.value);
    };

    const handleUpdateName = (evt) => {
        setName(evt.target.value);
    };

    const handleUpdateAmount = (evt) => {
        setAmount(evt.target.value);
    };

    const handleUpdateKind = (evt) => {
        setKind(evt.target.value);
    };

    const handleFetchBudget = async () => {
        const fetchedData = await fetchBudget(username);
        setItems(fetchedData);
    };

    const handleAddBudgetItem = async (item) => {
        const fetchedData = await addBudgetItem(username,item);
        setItems(fetchedData);
    };

    const handleDeleteBudgetItem = async (itemId) => {
        const fetchedData = await deleteBudgetItem(username,itemId);
        setItems(fetchedData);
    };

    const handleSubmit = async () => {
        const newItem = { name: name, amount: Number(amount), kind: kind };
        await handleAddBudgetItem(newItem);
        setName("");
        setAmount("");
    };

    const budgetJSX = items.map((item) => {
        const deleteFunction = () => handleDeleteBudgetItem(item.id);
        return (
            <div key={item.id}>
                <button onClick={deleteFunction}>x</button>
                {`${item.name}: $${item.amount} (${item.kind})`}
            </div>

        );
    });

    let income = 0;
    let expenses = 0;
    let whatifs = 0;

    for (const item of items) {

        if (item.kind === "income"){
            income+=item.amount;
        }
        else if (item.kind ==="expense"){
            expenses+=item.amount;
        }
        else{
            whatifs+=item.amount;
        }
    }

    const leftToSpend = income-expenses;
    const leftAfterWhatifs = leftToSpend-whatifs;

    return (
        <main>
            <h1>Budget app</h1>

            <div>
                <label htmlFor="username">Username:</label>
                <input id="username" type="text" value={username} onChange={handleUpdateUsername}/>
                <button onClick={handleFetchBudget}>Load Budget</button>
            </div>

            <div>
                <label htmlFor="name">Name:</label>
                <input id="name" type="text" value={name} onChange={handleUpdateName}/>
                <label htmlFor="amount">Amount:</label>
                <input id="amount" type="number" value={amount} onChange={handleUpdateAmount}/>
                <label htmlFor="kind">Type:</label>
                <select id="kind" value={kind} onChange={handleUpdateKind}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="whatif">What if</option>
                </select>
                <button onClick={handleSubmit}>Add</button>
            </div>

            <div>
                <p>Income: ${income}</p>
                <p>Expenses: ${expenses}</p>
                <p>Left to spend: ${leftToSpend}</p>
                <p>Left if what-ifs happen: ${leftAfterWhatifs}</p>
            </div>

            {budgetJSX}
        </main>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BudgetApp />);