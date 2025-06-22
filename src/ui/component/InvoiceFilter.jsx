import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiChevronDown, FiPrinter } from "react-icons/fi";

import styles from "./InvoiceFilter.module.css";
import "react-datepicker/dist/react-datepicker.css";

// Mock API functions
const fetchProducts = async () => {
  console.log("Fetching products...");
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "prod1", name: "Quantum-Core Processor" },
          { id: "prod2", name: "Hyper-Flux Capacitor" },
          { id: "prod3", name: "Nano-Lattice Alloy" },
        ]),
      500
    )
  );
};

const fetchMachines = async () => {
  console.log("Fetching machines...");
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "mach1", name: "Cryo-Fabricator X1" },
          { id: "mach2", name: "Plasma-Weaver Z-9" },
          { id: "mach3", name: "Fusion-Forge Titan" },
        ]),
      500
    )
  );
};

const InvoiceFilter = () => {
  const [activeFilter, setActiveFilter] = useState("Today");
  const [customDate, setCustomDate] = useState([null, null]);
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");

  const timeFilters = ["Today", "Weekly", "Next 10 Days", "Custom Date"];

  useEffect(() => {
    const loadData = async () => {
      // setLoading(true);
      try {
        const productsData = await window.productAPI.getProducts();
        const machinesData = await window.machineAPI.loadMachines();

        setProducts(productsData);
        setMachines(machinesData);

        console.log(productsData, machinesData, "datas");
      } catch (error) {
        console.error("Failed to load data:", error);
        // notification.error({
        //   message: "Failed to load data",
        //   description: error.message,
        // });
      }
      // finally {
      //   setLoading(false);
      // }
    };
    loadData();
  }, []);

  const handlePrint = () => {
    // This is where you would trigger a library like react-to-pdf or jspdf
    // For now, it will just use the browser's print functionality on a hidden element
    console.log("Printing invoice with settings:", {
      period: activeFilter,
      customDate: activeFilter === "Custom Date" ? customDate : "N/A",
      product: selectedProduct,
      machine: selectedMachine,
    });
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.filterCard}>
        <h2 className={styles.title}>Invoice & Report Filter</h2>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Time Period</h3>
          <div className={styles.checkboxGroup}>
            {timeFilters.map((filter) => (
              <div key={filter} className={styles.checkboxWrapper}>
                <input
                  type='radio'
                  id={filter}
                  name='timeFilter'
                  checked={activeFilter === filter}
                  onChange={() => setActiveFilter(filter)}
                  className={styles.radioInput}
                />
                <label htmlFor={filter} className={styles.radioLabel}>
                  {filter}
                </label>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {activeFilter === "Custom Date" && (
              <motion.div
                className={styles.datePickerWrapper}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiCalendar className={styles.datePickerIcon} />
                <DatePicker
                  selectsRange={true}
                  startDate={customDate[0]}
                  endDate={customDate[1]}
                  onChange={(update) => setCustomDate(update)}
                  isClearable={true}
                  placeholderText='Select a date range'
                  className={styles.datePicker}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Filter Options</h3>
          <div className={styles.dropdownGrid}>
            <div className={styles.dropdownWrapper}>
              <select
                className={styles.dropdown}
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value=''>Product Wise</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName}
                  </option>
                ))}
              </select>
              <FiChevronDown className={styles.dropdownIcon} />
            </div>
            <div className={styles.dropdownWrapper}>
              <select
                className={styles.dropdown}
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
              >
                <option value=''>Machine Wise</option>
                {machines.map((m) =>
                  m?.machines?.map((val) => (
                    <option key={val?.id} value={val.id}>
                      {val.name}
                    </option>
                  ))
                )}
              </select>
              <FiChevronDown className={styles.dropdownIcon} />
            </div>
          </div>
        </div>

        <div className={styles.buttonWrapper}>
          <button className={styles.printButton} onClick={handlePrint}>
            <FiPrinter />
            <span>Print / Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilter;
