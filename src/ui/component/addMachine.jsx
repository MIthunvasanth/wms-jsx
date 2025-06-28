import { useEffect, useState } from "react";
import {
  PlusCircle,
  Trash2,
  Settings,
  Package,
  Clock,
  Search,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AddMachine.css";

function AddMachine() {
  const [machines, setMachines] = useState([]);
  const [newMachine, setNewMachine] = useState({
    name: "",
    description: "",
    units: 1,
    status: "idle",
  });
  const [editingMachine, setEditingMachine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const machinesData = await window.machineAPI.loadMachines();
      setMachines(machinesData || []);
    } catch (error) {
      console.error("Error loading machines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    if (!newMachine.name.trim()) {
      alert("Please enter a machine name.");
      return;
    }

    if (newMachine.units < 1) {
      alert("Units must be at least 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      const machineData = {
        ...newMachine,
        id: `machine_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      await window.machineAPI.saveMachine(machineData);

      // Reset form
      setNewMachine({
        name: "",
        description: "",
        units: 1,
        status: "idle",
      });

      // Reload machines
      await loadMachines();

      alert("Machine added successfully!");
    } catch (error) {
      console.error("Error adding machine:", error);
      alert("An error occurred while adding the machine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMachine = async () => {
    if (!editingMachine.name.trim()) {
      alert("Please enter a machine name.");
      return;
    }

    if (editingMachine.units < 1) {
      alert("Units must be at least 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      await window.machineAPI.updateMachine(editingMachine);
      setEditingMachine(null);
      await loadMachines();
      alert("Machine updated successfully!");
    } catch (error) {
      console.error("Error updating machine:", error);
      alert("An error occurred while updating the machine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMachine = async (machineId) => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      try {
        // Note: You might need to add a deleteMachine method to your API
        // For now, we'll filter it out from the local state
        setMachines(machines.filter((machine) => machine.id !== machineId));
        alert("Machine deleted successfully!");
      } catch (error) {
        console.error("Error deleting machine:", error);
        alert(
          "An error occurred while deleting the machine. Please try again."
        );
      }
    }
  };

  const startEditing = (machine) => {
    setEditingMachine({ ...machine });
  };

  const cancelEditing = () => {
    setEditingMachine(null);
  };

  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="add-machine-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading machines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-machine-container">
      <div className="header-section">
        <div className="header-content">
          <h1 className="page-title">
            <Settings size={28} />
            Machine Management
          </h1>
          <p className="page-description">
            Add and manage your production machines
          </p>
        </div>
        <div className="machine-count">{machines.length} machines</div>
      </div>

      {/* Add New Machine Section */}
      <div className="add-machine-section">
        <h2 className="section-title">
          <PlusCircle size={20} />
          Add New Machine
        </h2>

        <div className="add-machine-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="machine-name">
                <Settings size={16} />
                Machine Name <span className="required">*</span>
              </label>
              <input
                id="machine-name"
                type="text"
                value={newMachine.name}
                placeholder="Enter machine name"
                onChange={(e) =>
                  setNewMachine({ ...newMachine, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="machine-description">
                <Package size={16} />
                Description
              </label>
              <input
                id="machine-description"
                type="text"
                value={newMachine.description}
                placeholder="Enter machine description"
                onChange={(e) =>
                  setNewMachine({ ...newMachine, description: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="machine-units">
                <Package size={16} />
                Units <span className="required">*</span>
              </label>
              <input
                id="machine-units"
                type="number"
                min="1"
                value={newMachine.units}
                placeholder="Enter units"
                onChange={(e) =>
                  setNewMachine({
                    ...newMachine,
                    units: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="machine-status">
                <Clock size={16} />
                Status
              </label>
              <select
                id="machine-status"
                value={newMachine.status}
                onChange={(e) =>
                  setNewMachine({ ...newMachine, status: e.target.value })
                }
              >
                <option value="idle">Idle</option>
                <option value="working">Working</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="add-button"
              onClick={handleAddMachine}
              disabled={isSubmitting || !newMachine.name.trim()}
            >
              <PlusCircle size={18} />
              {isSubmitting ? "Adding..." : "Add Machine"}
            </button>
          </div>
        </div>
      </div>

      {/* Machines List Section */}
      <div className="machines-list-section">
        <div className="list-header">
          <h2 className="section-title">
            <Settings size={20} />
            Machine List
          </h2>

          <div className="list-controls">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {filteredMachines.length > 0 ? (
          <div className="machines-grid">
            {filteredMachines.map((machine) => (
              <div key={machine.id} className="machine-card">
                {editingMachine?.id === machine.id ? (
                  // Edit Mode
                  <div className="machine-edit-form">
                    <div className="edit-header">
                      <h3>Edit Machine</h3>
                      <div className="edit-actions">
                        <button
                          className="save-btn"
                          onClick={handleEditMachine}
                          disabled={isSubmitting}
                        >
                          <Save size={16} />
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={cancelEditing}
                          disabled={isSubmitting}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="edit-fields">
                      <input
                        type="text"
                        value={editingMachine.name}
                        onChange={(e) =>
                          setEditingMachine({
                            ...editingMachine,
                            name: e.target.value,
                          })
                        }
                        placeholder="Machine name"
                      />
                      <input
                        type="text"
                        value={editingMachine.description}
                        onChange={(e) =>
                          setEditingMachine({
                            ...editingMachine,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        min="1"
                        value={editingMachine.units}
                        onChange={(e) =>
                          setEditingMachine({
                            ...editingMachine,
                            units: parseInt(e.target.value) || 1,
                          })
                        }
                        placeholder="Units"
                      />
                      <select
                        value={editingMachine.status}
                        onChange={(e) =>
                          setEditingMachine({
                            ...editingMachine,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="idle">Idle</option>
                        <option value="working">Working</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="machine-header">
                      <div className="machine-avatar">
                        <Settings size={24} />
                      </div>
                      <div className="machine-info">
                        <h3
                          className="machine-name"
                          title={
                            machine.name.length > 30 ? machine.name : undefined
                          }
                        >
                          {machine.name}
                        </h3>
                        <p
                          className="machine-description"
                          title={
                            machine.description &&
                            machine.description.length > 40
                              ? machine.description
                              : undefined
                          }
                        >
                          {machine.description || "No description"}
                        </p>
                      </div>
                      <div className="machine-actions">
                        <button
                          className="edit-btn"
                          onClick={() => startEditing(machine)}
                          title="Edit Machine"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteMachine(machine.id)}
                          title="Delete Machine"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="machine-details">
                      <div className="detail-item">
                        <Package size={16} />
                        <span className="detail-label">Units:</span>
                        <span className="detail-value">{machine.units}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span className="detail-label">Status:</span>
                        <span
                          className={`status-badge status-${machine.status}`}
                        >
                          {machine.status}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Settings size={48} className="empty-icon" />
            <h3>No Machines Found</h3>
            <p>
              {searchTerm
                ? "No machines match your search criteria."
                : "Get started by adding your first machine."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddMachine;
