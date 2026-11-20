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

const fetchDegree = async () => {
    const response = await fetch(`/degrees`);
    return await response.json();
};

const fetchLoans = async (username) => {
    const response = await fetch(`/loans/${username}`);
    return await response.json();
};

const addLoan = async (username, loan) => {
    const response = await fetch(`/loans/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loan),
    });
    return await response.json();
};

const deleteLoan = async (username, loanId) => {
    const response = await fetch(`/loans/${username}/${loanId}`, {
        method: "DELETE",
    });
    return await response.json();
};

// Simulates paying off a loan one month at a time.
// Returns null if the payment never pays the loan off.
const calculatePayoff = (loan) => {
    const monthlyRate = loan.rate / 100 / 12;
    let balance = loan.amount;
    let months = 0;
    let totalInterest = 0;

    if (loan.payment <= balance * monthlyRate) {
        return null;
    }

    while (balance > 0) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        balance = balance + interest - loan.payment;
        months += 1;
    }

    return { months: months, totalInterest: totalInterest };
};

function BudgetApp(){
    const [username, setUsername] = React.useState("");
    const [items, setItems] = React.useState([]);
    const [name, setName] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [kind, setKind] = React.useState("expense");
    const [degree, setDegree] = React.useState("");
    const [degrees, setDegrees] = React.useState([]);
    const [loans, setLoans] = React.useState([]);
    const [loadedUsername, setLoadedUsername] = React.useState("");
    const [error, setError] = React.useState("");
    const [loanName, setLoanName] = React.useState("");
    const [loanAmount, setLoanAmount] = React.useState("");
    const [loanRate, setLoanRate] = React.useState("");
    const [loanPayment, setLoanPayment] = React.useState("");

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

    const handleUpdateDegree = (evt) => {
        setDegree(evt.target.value);
    }

    const handleUpdateLoanName = (evt) => {
        setLoanName(evt.target.value);
    };

    const handleUpdateLoanAmount = (evt) => {
        setLoanAmount(evt.target.value);
    };

    const handleUpdateLoanRate = (evt) => {
        setLoanRate(evt.target.value);
    };

    const handleUpdateLoanPayment = (evt) => {
        setLoanPayment(evt.target.value);
    };

    const handleFetchBudget = async () => {
        if (username.trim() === "") {
            setError("Enter a username first.");
            return;
        }
        const fetchedData = await fetchBudget(username);
        setItems(fetchedData);
        const fetchedLoans = await fetchLoans(username);
        setLoans(fetchedLoans);
        setLoadedUsername(username);
        setError("");
    };

    const handleAddLoan = async () => {
        if (loadedUsername === "") {
            setError("Load a budget before adding a loan.");
            return;
        }
        if (loanName.trim() === "" || loanAmount === "" || loanRate === "" || loanPayment === "") {
            setError("Fill in every loan field.");
            return;
        }
        if (Number(loanAmount) <= 0 || Number(loanPayment) <= 0) {
            setError("Loan amount and monthly payment must be more than 0.");
            return;
        }
        if (Number(loanRate) < 0) {
            setError("Interest rate can't be negative.");
            return;
        }
        setError("");
        const newLoan = {
            name: loanName,
            amount: Number(loanAmount),
            rate: Number(loanRate),
            payment: Number(loanPayment),
        };
        const fetchedData = await addLoan(loadedUsername, newLoan);
        setLoans(fetchedData);
        setLoanName("");
        setLoanAmount("");
        setLoanRate("");
        setLoanPayment("");
    };

    const handleDeleteLoan = async (loanId) => {
        const fetchedData = await deleteLoan(loadedUsername, loanId);
        setLoans(fetchedData);
    };


    const handleAddBudgetItem = async (item) => {
        const fetchedData = await addBudgetItem(loadedUsername, item);
        setItems(fetchedData);
    };

    const handleDeleteBudgetItem = async (itemId) => {
        const fetchedData = await deleteBudgetItem(loadedUsername, itemId);
        setItems(fetchedData);
    };

    const handleSubmit = async () => {
        if (loadedUsername === "") {
            setError("Load a budget before adding items.");
            return;
        }
        if (name.trim() === "" || amount === "") {
            setError("Fill in a name and an amount.");
            return;
        }
        if (Number(amount) <= 0) {
            setError("Amount must be more than 0.");
            return;
        }
        setError("");
        const newItem = { name: name, amount: Number(amount), kind: kind };
        await handleAddBudgetItem(newItem);
        setName("");
        setAmount("");
    };

    const handleFetchDegree = async () => {
        const fetchedData = await fetchDegree();
        setDegrees(fetchedData);
    };

    React.useEffect(() => {
        handleFetchDegree();
    }, []);

    const degreeOptionsJSX = degrees.map((d) => {
        return (
            <option key={d.degree} value={d.degree}>{d.degree}</option>
        );
    });

    const selectedDegree = degrees.find((d) => d.degree === degree);

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

    let totalLoanPayments = 0;
    for (const loan of loans) {
        totalLoanPayments += loan.payment;
    }
    const leftAfterLoans = leftToSpend - totalLoanPayments;

    const loansJSX = loans.map((loan) => {
        const deleteFunction = () => handleDeleteLoan(loan.id);
        const payoff = calculatePayoff(loan);

        let resultText = "";
        if (payoff === null) {
            resultText = "Payment doesn't cover the interest, so this loan never gets paid off";
        } else {
            const years = Math.floor(payoff.months / 12);
            const extraMonths = payoff.months % 12;
            resultText = `Paid off in ${payoff.months} months (${years} years, ${extraMonths} months), total interest $${payoff.totalInterest.toFixed(2)}, total paid $${(loan.amount + payoff.totalInterest).toFixed(2)}`;
        }

        return (
            <div key={loan.id}>
                <button onClick={deleteFunction}>x</button>
                {`${loan.name}: $${loan.amount} at ${loan.rate}%, paying $${loan.payment}/month. `}
                {resultText}
            </div>
        );
    });

    return (
        <main>
            <h1>Budget app</h1>

            {error !== "" && <p style={{ color: "red" }}>{error}</p>}
            {loadedUsername !== "" && <p>Showing budget for {loadedUsername}</p>}

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
                <label htmlFor="degree">Degree:</label>
                <select id="degree" value={degree} onChange={handleUpdateDegree}>
                    <option value="">Pick a degree</option>
                    {degreeOptionsJSX}
                </select>
                {selectedDegree && (
                    <div>
                        <p>Early career salary: ${selectedDegree.early} per year (${Math.round(selectedDegree.early / 12)} per month)</p>
                        <p>Mid career salary: ${selectedDegree.mid} per year (${Math.round(selectedDegree.mid / 12)} per month)</p>
                    </div>
                )}
            </div>

            <div>
                <p>Income: ${income}</p>
                <p>Expenses: ${expenses}</p>
                <p>Left to spend: ${leftToSpend}</p>
                <p>Left if what-ifs happen: ${leftAfterWhatifs}</p>
            </div>

            {budgetJSX}

            <h2>Student loans</h2>
            <div>
                <label htmlFor="loanName">Loan name:</label>
                <input id="loanName" type="text" value={loanName} onChange={handleUpdateLoanName}/>
                <label htmlFor="loanAmount">Amount:</label>
                <input id="loanAmount" type="number" value={loanAmount} onChange={handleUpdateLoanAmount}/>
                <label htmlFor="loanRate">Interest rate (%):</label>
                <input id="loanRate" type="number" value={loanRate} onChange={handleUpdateLoanRate}/>
                <label htmlFor="loanPayment">Monthly payment:</label>
                <input id="loanPayment" type="number" value={loanPayment} onChange={handleUpdateLoanPayment}/>
                <button onClick={handleAddLoan}>Add loan</button>
            </div>

            {loansJSX}

            <div>
                <p>Total monthly loan payments: ${totalLoanPayments}</p>
                <p>Left to spend after loan payments: ${leftAfterLoans}</p>
                {selectedDegree && (
                    <p>Loan payments would take {((totalLoanPayments / (selectedDegree.early / 12)) * 100).toFixed(1)}% of a {selectedDegree.degree} early career monthly salary</p>
                )}
            </div>
        </main>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BudgetApp />);