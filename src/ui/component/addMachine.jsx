import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

function AddMachine() {
  const [company, setCompany] = useState({
    name: "",
    address: "",
    gst: "",
    quantity: "",
    startDateTime: "",
    endDateTime: "",
    dailyHours: "",
  });

  const [machineName, setMachineName] = useState("");
  const [timePerUnit, setTimePerUnit] = useState("");
  const [machines, setMachines] = useState([]);

  const handleAddMachine = () => {
    if (machineName.trim() && timePerUnit.trim() && parseInt(timePerUnit) > 0) {
      setMachines((prev) => [
        ...prev,
        {
          name: machineName.trim(),
          timePerUnit: parseInt(timePerUnit),
        },
      ]);
      setMachineName("");
      setTimePerUnit("");
    } else {
      alert("Enter valid machine name and time (in minutes).");
    }
  };

  const handleDeleteMachine = (indexToDelete) => {
    setMachines((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  function generateUniqueId(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleSubmit = async () => {
    const { name, address, gst, startDateTime, endDateTime, dailyHours } =
      company;
    if (
      name.trim() &&
      address.trim() &&
      gst.trim() &&
      startDateTime &&
      endDateTime &&
      dailyHours &&
      machines.length > 0
    ) {
      const companyData = { id: generateUniqueId(), ...company, machines };
      try {
        const response = await window.machineAPI.saveMachine(companyData);
        console.log("Save response:", response);
        alert("Company and machines saved successfully!");
      } catch (error) {
        console.error("Error during submission:", error);
        alert("Error during submission.");
      }

      setCompany({
        name: "",
        address: "",
        gst: "",
        quantity: "",
        startDateTime: "",
        endDateTime: "",
        dailyHours: "",
      });
      setMachines([]);
    } else {
      alert("Please fill all fields and add at least one machine.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add Company Details & Machines</h2>

      <div style={styles.formGrid}>
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
        <input
          type='text'
          value={company.quantity}
          placeholder='Quantity'
          onChange={(e) => setCompany({ ...company, quantity: e.target.value })}
          style={styles.input}
        />
        <input
          type='datetime-local'
          value={company.startDateTime}
          onChange={(e) =>
            setCompany({ ...company, startDateTime: e.target.value })
          }
          style={styles.input}
        />
        <input
          type='datetime-local'
          value={company.endDateTime}
          onChange={(e) =>
            setCompany({ ...company, endDateTime: e.target.value })
          }
          style={styles.input}
        />
        <input
          type='number'
          min='1'
          max='24'
          value={company.dailyHours}
          placeholder='Daily Work Hours'
          onChange={(e) =>
            setCompany({ ...company, dailyHours: e.target.value })
          }
          style={styles.input}
        />
      </div>

      <h3 style={{ marginTop: "30px" }}>Add Machines</h3>

      <div style={styles.addMachineRow}>
        <input
          type='text'
          value={machineName}
          placeholder='Machine name'
          onChange={(e) => setMachineName(e.target.value)}
          style={{ ...styles.input, width: "40%" }}
        />
        <input
          type='number'
          min='1'
          value={timePerUnit}
          placeholder='Time per unit (mins)'
          onChange={(e) => setTimePerUnit(e.target.value)}
          style={{ ...styles.input, width: "40%" }}
        />
        <button onClick={handleAddMachine} style={styles.addButton}>
          <PlusCircle size={20} />
        </button>
      </div>

      {machines.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>#</th>
              <th style={styles.tableHeader}>Machine Name</th>
              <th style={styles.tableHeader}>Time/Unit (mins)</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine, index) => (
              <tr key={index} style={styles.tableRow}>
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={styles.tableCell}>{machine.name}</td>
                <td style={styles.tableCell}>{machine.timePerUnit}</td>
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
    maxWidth: "900px",
    margin: "40px auto",
    background: "#f9fafb",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
  },
  heading: {
    marginBottom: "25px",
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "#ffffff",
    width: "90%",
  },
  addMachineRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  addButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "25px",
  },
  tableHeader: {
    backgroundColor: "#e5e7eb",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "16px",
    color: "#111827",
  },
  tableRow: {
    borderBottom: "1px solid #d1d5db",
    color: "black",
  },
  tableCell: {
    padding: "12px",
    fontSize: "15px",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  submitButton: {
    marginTop: "30px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "10px",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
    width: "90%",
    textAlign: "center",
  },
};

export default AddMachine;
