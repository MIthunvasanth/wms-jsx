import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

function AddMachine() {
  const [company, setCompany] = useState({
    name: "",
    address: "",
    gst: "",
  });

  const [machineName, setMachineName] = useState("");
  const [machines, setMachines] = useState([]);

  const handleAddMachine = () => {
    if (machineName.trim()) {
      setMachines((prev) => [...prev, machineName.trim()]);
      setMachineName("");
    }
  };

  const handleDeleteMachine = (indexToDelete) => {
    setMachines((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleSubmit = async () => {
    if (
      company.name.trim() &&
      company.address.trim() &&
      company.gst.trim() &&
      machines.length > 0
    ) {
      const companyData = { ...company, machines };
      try {
        const response = await window.machineAPI.saveMachine(companyData);
        console.log("Save response:", response);
      } catch (error) {
        console.error("Error during submission:", error);
      }
      setCompany({ name: "", address: "", gst: "" });
      setMachines([]);
    } else {
      alert("Please fill all company details and add at least one machine.");
    }
  };

  return (
    <div className='add-machine-container' style={styles.container}>
      <h2 style={styles.heading}>Add Company Details</h2>

      <input
        type='text'
        value={company.name}
        placeholder='Company Name'
        onChange={(e) => setCompany({ ...company, name: e.target.value })}
        style={styles.input}
      />
      <input
        type='text'
        value={company.address}
        placeholder='Company Address'
        onChange={(e) => setCompany({ ...company, address: e.target.value })}
        style={styles.input}
      />
      <input
        type='text'
        value={company.gst}
        placeholder='GST Number'
        onChange={(e) => setCompany({ ...company, gst: e.target.value })}
        style={styles.input}
      />

      <h3 style={{ marginTop: "30px" }}>Add Machines</h3>

      <div style={styles.addMachineRow}>
        <input
          type='text'
          value={machineName}
          placeholder='Enter machine name'
          onChange={(e) => setMachineName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAddMachine} style={styles.addButton}>
          <PlusCircle size={20} />
        </button>
      </div>

      {machines.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>#</th>
                <th style={styles.tableHeader}>Machine Name</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>{index + 1}</td>
                  <td style={styles.tableCell}>{machine}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleDeleteMachine(index)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={handleSubmit} style={styles.submitButton}>
        Submit Company & Machines
      </button>
    </div>
  );
}
const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginTop: "40px",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "white",
  },
  addMachineRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  addButton: {
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    padding: "10px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "16px",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "10px",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 8px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  submitButton: {
    marginTop: "30px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    width: "90%",
  },
};

export default AddMachine;
