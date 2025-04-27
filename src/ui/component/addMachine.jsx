import { useState } from "react";

function AddMachine() {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (name.trim()) {
      // Send the machine name to the main process to be saved
      const response = await window.machineAPI.saveMachine(name.trim());
      console.log(response); // Log the response from the main process
      setName(""); // Clear the input field
    }
  };

  return (
    <div className="add-machine-container">
  <input
    type="text"
    value={name}
    placeholder="Enter machine name"
    onChange={(e) => setName(e.target.value)}
  />
  <button onClick={handleSubmit}>Add Machine</button>
</div>

  );
}

export default AddMachine;
