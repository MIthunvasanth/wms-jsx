import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProcess.css";

const defaultCards = [
  {
    id: 1,
    productName: "Hydraulic Cylinder",
    productNo: "HC-2023-001",
    partNo: "PT-9876",
    drawingNo: "DRW-4567",
    completeQty: 150,
    penaltyQty: 5,
  },
  {
    id: 2,
    productName: "Pneumatic Valve",
    productNo: "PV-2023-002",
    partNo: "PT-5432",
    drawingNo: "DRW-7890",
    completeQty: 200,
    penaltyQty: 8,
  },
  {
    id: 3,
    productName: "Gear Assembly",
    productNo: "GA-2023-003",
    partNo: "PT-1122",
    drawingNo: "DRW-3344",
    completeQty: 75,
    penaltyQty: 3,
  },
];

const AddProcess = () => {
  const [formData, setFormData] = useState({
    productName: "",
    productNo: "",
    partNo: "",
    drawingNo: "",
    completeQty: "",
    penaltyQty: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    setFormData({
      productName: card.productName,
      productNo: card.productNo,
      partNo: card.partNo,
      drawingNo: card.drawingNo,
      completeQty: card.completeQty.toString(),
      penaltyQty: card.penaltyQty.toString(),
      description: "",
    });
    setSelectedCard(card.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["productName", "productNo", "partNo", "drawingNo"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field].trim()
    );

    if (missingFields.length > 0) {
      setError("Please fill all required fields.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await window.processAPI.addProcess(formData);
      navigate("/processes");
    } catch (err) {
      console.error("Failed to add process:", err);
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className='add-process-container'>
      <h2>{showForm ? "Create New Process" : "Select a Product Template"}</h2>

      {!showForm ? (
        <div className='card-grid'>
          {defaultCards.map((card) => (
            <div
              key={card.id}
              className={`process-card ${
                selectedCard === card.id ? "selected" : ""
              }`}
              onClick={() => handleCardClick(card)}
            >
              <h3>{card.productName}</h3>
              <p>
                <strong>Product No:</strong> {card.productNo}
              </p>
              <p>
                <strong>Part No:</strong> {card.partNo}
              </p>
              <p>
                <strong>Drawing No:</strong> {card.drawingNo}
              </p>
            </div>
          ))}
          {/* <div
            className='process-card new-card'
            onClick={() => {
              setShowForm(true);
              setFormData({
                productName: "",
                productNo: "",
                partNo: "",
                drawingNo: "",
                completeQty: "",
                penaltyQty: "",
                description: "",
              });
            }}
          >
            <h3>+ Create New Template</h3>
            <p>Start from scratch</p>
          </div> */}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='add-process-form'>
          <div className='form-row'>
            <div className='form-col'>
              <div className='form-group'>
                <label htmlFor='productName'>Product Name *</label>
                <input
                  id='productName'
                  name='productName'
                  type='text'
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder='e.g., Hydraulic Cylinder'
                  disabled={isSubmitting}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='productNo'>Product Number *</label>
                <input
                  id='productNo'
                  name='productNo'
                  type='text'
                  value={formData.productNo}
                  onChange={handleChange}
                  placeholder='e.g., HC-2023-001'
                  disabled={isSubmitting}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='partNo'>Part Number *</label>
                <input
                  id='partNo'
                  name='partNo'
                  type='text'
                  value={formData.partNo}
                  onChange={handleChange}
                  placeholder='e.g., PT-9876'
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className='form-col'>
              <div className='form-group'>
                <label htmlFor='drawingNo'>Drawing Number *</label>
                <input
                  id='drawingNo'
                  name='drawingNo'
                  type='text'
                  value={formData.drawingNo}
                  onChange={handleChange}
                  placeholder='e.g., DRW-4567'
                  disabled={isSubmitting}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='completeQty'>Complete Quantity</label>
                <input
                  id='completeQty'
                  name='completeQty'
                  type='number'
                  value={formData.completeQty}
                  onChange={handleChange}
                  placeholder='e.g., 150'
                  disabled={isSubmitting}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='penaltyQty'>Penalty Quantity</label>
                <input
                  id='penaltyQty'
                  name='penaltyQty'
                  type='number'
                  value={formData.penaltyQty}
                  onChange={handleChange}
                  placeholder='e.g., 5'
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='description'>Description</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Additional details about the process'
              disabled={isSubmitting}
            />
          </div>
          {error && <p className='error-message'>{error}</p>}
          <div className='button-group'>
            <button
              type='button'
              className='cancel-btn'
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type='submit'
              className='submit-btn'
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Create Process"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProcess;
