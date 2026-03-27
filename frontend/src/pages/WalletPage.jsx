import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const initialDepositForm = {
  amount: "",
  paymentMethod: "debit",
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

export default function WalletPage() {
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [depositForm, setDepositForm] = useState(initialDepositForm);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPositiveTransaction = (type) =>
    ["deposit", "win", "adjustment"].includes(type);

  const handleDepositChange = (event) => {
    const { name, value } = event.target;
    setDepositForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchWallet = async () => {
    try {
      const res = await API.get("/wallet");
      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
    } catch (err) {
      setError("Failed to load wallet");
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const deposit = async () => {
    try {
      setError("");
      setSuccess("");
      await API.post("/wallet/deposit", {
        amount: Number(depositForm.amount),
        paymentMethod: depositForm.paymentMethod,
        cardholderName: depositForm.cardholderName,
        cardNumber: depositForm.cardNumber,
        expiry: depositForm.expiry,
        cvv: depositForm.cvv,
      });
      setDepositForm(initialDepositForm);
      setSuccess("Deposit successful");
      await fetchWallet();
      await refreshUser();
    } catch (err) {
      setError(err?.response?.data?.message || "Deposit failed");
    }
  };

  const withdraw = async () => {
    try {
      setError("");
      setSuccess("");
      await API.post("/wallet/withdraw", {
        amount: Number(withdrawAmount),
      });
      setWithdrawAmount("");
      setSuccess("Withdrawal requested");
      await fetchWallet();
      await refreshUser();
    } catch (err) {
      setError(err?.response?.data?.message || "Withdraw failed");
    }
  };

  return (
    <div className="page-wrap">
      <h2 className="page-title">Wallet</h2>

      <div className="balance-hero">
        <p className="balance-label">AVAILABLE BALANCE</p>
        <p className="balance-amount">Rs. {Number(balance || 0).toLocaleString("en-IN")}</p>
      </div>

      {error && <div className="toast err">{error}</div>}
      {success && <div className="toast ok">{success}</div>}

      <div className="wallet-grid">
        <div className="wallet-box">
          <h3 className="box-title">ADD MONEY</h3>
          <div className="payment-type-row">
            {["debit", "credit"].map((type) => (
              <button
                key={type}
                type="button"
                className={`quick-btn ${depositForm.paymentMethod === type ? "active" : ""}`}
                onClick={() =>
                  setDepositForm((prev) => ({
                    ...prev,
                    paymentMethod: type,
                  }))
                }
              >
                {type === "debit" ? "Debit Card" : "Credit Card"}
              </button>
            ))}
          </div>

          <input
            className="inp"
            type="number"
            placeholder="Enter amount"
            name="amount"
            value={depositForm.amount}
            onChange={handleDepositChange}
          />
          <input
            className="inp"
            type="text"
            placeholder="Cardholder name"
            name="cardholderName"
            value={depositForm.cardholderName}
            onChange={handleDepositChange}
          />
          <input
            className="inp"
            type="text"
            inputMode="numeric"
            placeholder="Card number"
            name="cardNumber"
            value={depositForm.cardNumber}
            onChange={handleDepositChange}
            maxLength={19}
          />

          <div className="wallet-inline-grid">
            <input
              className="inp"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              name="expiry"
              value={depositForm.expiry}
              onChange={handleDepositChange}
              maxLength={5}
            />
            <input
              className="inp"
              type="password"
              inputMode="numeric"
              placeholder="CVV"
              name="cvv"
              value={depositForm.cvv}
              onChange={handleDepositChange}
              maxLength={4}
            />
          </div>

          <div className="quick-bets">
            {[500, 1000, 2000, 5000].map((value) => (
              <button
                key={value}
                type="button"
                className="quick-btn"
                onClick={() =>
                  setDepositForm((prev) => ({
                    ...prev,
                    amount: String(value),
                  }))
                }
              >
                Rs. {value}
              </button>
            ))}
          </div>

          <div className="wallet-actions">
            <button className="big-btn" onClick={deposit}>
              Deposit
            </button>
          </div>
        </div>

        <div className="wallet-box">
          <h3 className="box-title">WITHDRAW MONEY</h3>
          <input
            className="inp"
            type="number"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />

          <div className="quick-bets">
            {[500, 1000, 2000, 5000].map((value) => (
              <button
                key={value}
                type="button"
                className="quick-btn"
                onClick={() => setWithdrawAmount(String(value))}
              >
                Rs. {value}
              </button>
            ))}
          </div>

          <div className="wallet-actions">
            <button className="big-btn outline" onClick={withdraw}>
              Withdraw
            </button>
          </div>
        </div>

        <div className="history-box">
          <h3 className="box-title">TRANSACTION HISTORY</h3>
          {transactions.length === 0 && <p className="empty-note">No transactions yet</p>}

          {transactions.map((tx) => (
            <div key={tx._id} className="tx-row">
              <div>
                <span className={isPositiveTransaction(tx.type) ? "tx-pos" : "tx-neg"}>
                  {isPositiveTransaction(tx.type) ? "+" : "-"}Rs. {Number(tx.amount || 0).toLocaleString("en-IN")}
                </span>
                <span className="tx-type"> . {tx.type}</span>
                {tx.note ? <div className="tx-note">{tx.note}</div> : null}
              </div>
              <span className="tx-date">{tx.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
