import { useEffect, useState } from "react";
import { PlusCircle, Trash2, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./AddMachine.css";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const getCompanyData = (id) => {
    window.machineAPI.getCompanies().then((data) => {
      const matchedCompany = data.find((company) => company.id === id);
      if (matchedCompany) {
        const {
          name,
          address,
          gst,
          quantity,
          startDateTime,
          endDateTime,
          dailyHours,
          machines = [],
        } = matchedCompany;

        setCompany({
          name,
          address,
          gst,
          quantity,
          startDateTime,
          endDateTime,
          dailyHours,
        });

        setMachines(machines);
      }
    });
  };

  useEffect(() => {
    if (id) {
      getCompanyData(id);
    } else {
      setCompany([]);
      setMachines([]);
    }
  }, [id]);

  const handleAddMachine = () => {
    if (machineName.trim() && timePerUnit.trim() && parseInt(timePerUnit) > 0) {
      setMachines((prev) => [
        ...prev,
        {
          name: machineName.trim(),
          timePerUnit: parseInt(timePerUnit),
          id: Date.now().toString(), // Add unique ID for each machine
        },
      ]);
      setMachineName("");
      setTimePerUnit("");
    } else {
      alert(
        "Please enter a valid machine name and time (must be greater than 0)."
      );
    }
  };

  const handleDeleteMachine = (machineId) => {
    setMachines((prev) => prev.filter((machine) => machine.id !== machineId));
  };

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  const handleSubmit = async () => {
    const { name, address, gst, startDateTime, endDateTime, dailyHours } =
      company;

    if (
      !name.trim() ||
      !address.trim() ||
      !gst.trim() ||
      !startDateTime ||
      !endDateTime ||
      !dailyHours ||
      machines.length === 0
    ) {
      alert("Please fill all required fields and add at least one machine.");
      return;
    }

    setIsSubmitting(true);

    const companyData = {
      id: id || generateUniqueId(),
      ...company,
      machines,
    };

    try {
      const response = id
        ? await window.machineAPI.updateMachine(companyData)
        : await window.machineAPI.saveMachine(companyData);

      console.log("Save/Update response:", response);
      alert(`Company ${id ? "updated" : "created"} successfully!`);
      navigate("/list-comapany");
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-machine-container">
      <div className="header-section">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          Back
        </button>
        <h1 className="page-title">
          {id ? "Edit Company & Machines" : "Add New Company"}
        </h1>
      </div>

      <div className="form-section">
        <h2 className="section-title">Company Information</h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="company-name">Company Name*</label>
            <input
              id="company-name"
              type="text"
              value={company.name}
              placeholder="Enter company name"
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company-address">Company Address*</label>
            <input
              id="company-address"
              type="text"
              value={company.address}
              placeholder="Enter company address"
              onChange={(e) =>
                setCompany({ ...company, address: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="gst-number">GST Number*</label>
            <input
              id="gst-number"
              type="text"
              value={company.gst}
              placeholder="Enter GST number"
              onChange={(e) => setCompany({ ...company, gst: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="text"
              value={company.quantity}
              placeholder="Enter quantity"
              onChange={(e) =>
                setCompany({ ...company, quantity: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="start-date">Start Date*</label>
            <input
              id="start-date"
              type="datetime-local"
              value={company.startDateTime}
              onChange={(e) =>
                setCompany({ ...company, startDateTime: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-date">End Date*</label>
            <input
              id="end-date"
              type="datetime-local"
              value={company.endDateTime}
              onChange={(e) =>
                setCompany({ ...company, endDateTime: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="daily-hours">Daily Work Hours*</label>
            <input
              id="daily-hours"
              type="number"
              min="1"
              max="24"
              value={company.dailyHours}
              placeholder="Enter daily hours"
              onChange={(e) =>
                setCompany({ ...company, dailyHours: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="machines-section">
        <h2 className="section-title">Machines</h2>
        <p className="section-description">
          Add at least one machine to continue
        </p>

        <div className="add-machine-form">
          <div className="input-group">
            <input
              type="text"
              value={machineName}
              placeholder="Machine name"
              onChange={(e) => setMachineName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddMachine()}
            />
            <input
              type="number"
              min="1"
              value={timePerUnit}
              placeholder="Time per unit (minutes)"
              onChange={(e) => setTimePerUnit(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddMachine()}
            />
            <button
              className="add-machine-button"
              onClick={handleAddMachine}
              disabled={!machineName.trim() || !timePerUnit.trim()}
            >
              <PlusCircle size={18} />
              Add Machine
            </button>
          </div>
        </div>

        {machines.length > 0 ? (
          <div className="machines-table-container">
            <table className="machines-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Machine Name</th>
                  <th>Time/Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine, index) => (
                  <tr key={machine.id}>
                    <td>{index + 1}</td>
                    <td>{machine.name}</td>
                    <td>{machine.timePerUnit} mins</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteMachine(machine.id)}
                        aria-label={`Delete ${machine.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No machines added yet</p>
          </div>
        )}
      </div>

      <div className="actions-section">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner"></span>
          ) : id ? (
            "Update Company"
          ) : (
            "Create Company"
          )}
        </button>
      </div>
    </div>
  );
}

export default AddMachine;
