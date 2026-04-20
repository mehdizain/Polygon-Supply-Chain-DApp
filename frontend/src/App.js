import { useState, useEffect } from "react";
import { ethers } from "ethers";
import SupplyChainABI from "./SupplyChain.json";
import { CONTRACT_ADDRESS, AMOY_CHAIN_ID } from "./ContractConfig";

const ROLES = ["None", "Manufacturer", "Distributor", "Retailer", "Customer"];
const STATUSES = ["Manufactured", "In Transit", "Delivered"];

export default function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [myRole, setMyRole] = useState(0);
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [targetAddress, setTargetAddress] = useState("");
  const [targetRole, setTargetRole] = useState(1);
  const [newProduct, setNewProduct] = useState({ name: "", description: "" });
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AMOY_CHAIN_ID }],
    });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    const c = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI.abi, signer);
    setContract(c);
    const role = await c.getMyRole();
    setMyRole(Number(role));
  };

  const registerProduct = async () => {
    if (!contract) return;
    setStatus("Registering product...");
    try {
      const tx = await contract.registerProduct(newProduct.name, newProduct.description);
      await tx.wait();
      setStatus(`✅ Product registered! TX: ${tx.hash}`);
    } catch (e) { setStatus(`❌ Error: ${e.message}`); }
  };

  const fetchProduct = async () => {
    if (!contract || !productId) return;
    try {
      const p = await contract.getProduct(productId);
      setProduct(p);
      const h = await contract.getHistory(productId);
      setHistory(h);
    } catch (e) { setStatus(`❌ Error: ${e.message}`); }
  };

  const assignRole = async () => {
    if (!contract) return;
    setStatus("Assigning role...");
    try {
      const tx = await contract.assignRole(targetAddress, targetRole);
      await tx.wait();
      setStatus(`✅ Role assigned! TX: ${tx.hash}`);
    } catch (e) { setStatus(`❌ Error: ${e.message}`); }
  };

  const transferProduct = async () => {
    if (!contract || !productId || !targetAddress) return;
    setStatus("Transferring...");
    try {
      let tx;
      if (myRole === 1) tx = await contract.transferToDistributor(productId, targetAddress);
      else if (myRole === 2) tx = await contract.transferToRetailer(productId, targetAddress);
      else if (myRole === 3) tx = await contract.transferToCustomer(productId, targetAddress);
      await tx.wait();
      setStatus(`✅ Transferred! TX: ${tx.hash}`);
    } catch (e) { setStatus(`❌ Error: ${e.message}`); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔗 Supply Chain DApp</h1>
        <p style={styles.subtitle}>Developed by <strong>Zain Mehdi</strong> | Polygon Amoy Testnet</p>
      </div>

      {!account ? (
        <button style={styles.btn} onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div style={styles.badge}>
          ✅ Connected: {account.slice(0,6)}...{account.slice(-4)} | Role: <strong>{ROLES[myRole]}</strong>
        </div>
      )}

      {account && (
        <>
          {/* Admin: Assign Role */}
          <div style={styles.card}>
            <h2>👤 Assign Role (Admin Only)</h2>
            <input style={styles.input} placeholder="Wallet Address" onChange={e => setTargetAddress(e.target.value)} />
            <select style={styles.input} onChange={e => setTargetRole(Number(e.target.value))}>
              {ROLES.slice(1).map((r, i) => <option key={i} value={i+1}>{r}</option>)}
            </select>
            <button style={styles.btn} onClick={assignRole}>Assign Role</button>
          </div>

          {/* Manufacturer: Register Product */}
          {myRole === 1 && (
            <div style={styles.card}>
              <h2>📦 Register New Product</h2>
              <input style={styles.input} placeholder="Product Name" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input style={styles.input} placeholder="Description" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <button style={styles.btn} onClick={registerProduct}>Register Product</button>
            </div>
          )}

          {/* Transfer Ownership */}
          {[1,2,3].includes(myRole) && (
            <div style={styles.card}>
              <h2>🔄 Transfer Product</h2>
              <input style={styles.input} placeholder="Product ID" onChange={e => setProductId(e.target.value)} />
              <input style={styles.input} placeholder="Recipient Address" onChange={e => setTargetAddress(e.target.value)} />
              <button style={styles.btn} onClick={transferProduct}>
                Transfer to {myRole === 1 ? "Distributor" : myRole === 2 ? "Retailer" : "Customer"}
              </button>
            </div>
          )}

          {/* View Product & History */}
          <div style={styles.card}>
            <h2>🔍 Track Product</h2>
            <input style={styles.input} placeholder="Product ID" onChange={e => setProductId(e.target.value)} />
            <button style={styles.btn} onClick={fetchProduct}>Fetch Product</button>
            {product && (
              <div style={styles.productBox}>
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Owner:</strong> {product.currentOwner}</p>
                <p><strong>Status:</strong> <span style={styles.statusBadge}>{STATUSES[Number(product.status)]}</span></p>
              </div>
            )}
            {history.length > 0 && (
              <div>
                <h3>📜 Audit Trail</h3>
                {history.map((h, i) => (
                  <div key={i} style={styles.historyItem}>
                    <span>Step {i+1}: </span>
                    <span>{h.from === ethers.ZeroAddress ? "Genesis" : h.from.slice(0,8)+"..."} → {h.to.slice(0,8)}...</span>
                    <span style={styles.statusBadge}>{STATUSES[Number(h.status)]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {status && <div style={styles.statusBox}>{status}</div>}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "0 auto", padding: 24, fontFamily: "sans-serif", background: "#f0f4ff", minHeight: "100vh" },
  header: { background: "linear-gradient(135deg, #6c63ff, #3b82f6)", borderRadius: 16, padding: 32, marginBottom: 24, color: "#fff", textAlign: "center" },
  title: { margin: 0, fontSize: 32 },
  subtitle: { margin: "8px 0 0", opacity: 0.9 },
  card: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  input: { width: "100%", padding: "10px 12px", marginBottom: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" },
  btn: { background: "#6c63ff", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontSize: 15, width: "100%" },
  badge: { background: "#e0f7e9", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 },
  productBox: { background: "#f8f9ff", borderRadius: 8, padding: 16, marginTop: 12 },
  historyItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee", fontSize: 13 },
  statusBadge: { background: "#6c63ff", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 12 },
  statusBox: { background: "#fff8e1", borderRadius: 8, padding: 16, marginTop: 8, fontSize: 13, wordBreak: "break-all" },
};