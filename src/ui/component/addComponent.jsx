import React, { useState, useEffect } from 'react';
import '../style/addmachine.css'

const AddComponent = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [processes, setProcesses] = useState([{ machine: '', time: '' }]);
  const [machines, setMachines] = useState([]);

  // Load machine names from machineAPI
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const machineList = await window.machineAPI.loadMachines();
        setMachines(machineList);
      } catch (error) {
        console.error('Failed to load machines', error);
      }
    };

    fetchMachines();
  }, []);

  const handleAddProcess = () => {
    setProcesses([...processes, { machine: '', time: '' }]);
  };

  const handleProcessChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    updatedProcesses[index][field] = value;
    setProcesses(updatedProcesses);
  };

  const handleSubmit = async () => {
    const componentData = {
      serialNumber,
      productName,
      processes,
    };
  
    try {
      await window.componentAPI.saveComponent(componentData);
      alert('Component saved successfully!');
      // Optionally, clear fields here
    } catch (error) {
      console.error(error);
      alert('Failed to save component: ' + error.message);
    }
  };
  

  return (
    <div className="add-component-container">
      <h2>Add Component</h2>

      <div className="form-group">
        <input
          type="text"
          placeholder="Product Serial Number"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <h3>Processes</h3>

      {processes.map((process, index) => (
        <div key={index} className="process-row">
          <select
            value={process.machine}
            onChange={(e) => handleProcessChange(index, 'machine', e.target.value)}
          >
            <option value="">Select Machine</option>
            {machines.map((machine, idx) => (
              <option key={idx} value={machine}>
                {machine}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Time (minutes)"
            value={process.time}
            onChange={(e) => handleProcessChange(index, 'time', e.target.value)}
          />
        </div>
      ))}

      <button className="add-process-btn" onClick={handleAddProcess}>
        + Add Another Process
      </button>

      <div>
        <button className="save-btn" onClick={handleSubmit}>
          Save Component
        </button>
      </div>
    </div>
  );
};

export default AddComponent;
