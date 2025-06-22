import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import AddMachine from "./component/addMachine";
import AddComponent from "./component/addComponent";
import CompanyList from "./component/Comapnylist";
import WeeklyMachineSchedule from "./WeeklyMachineSchedule";
import Login from "./component/login";
import Signup from "./component/signup";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import WindowControls from "./component/WindowControls";
import ProductMaster from "./component/ProductMaster";
import AddProcess from "./component/AddProcess";
import ProcessList from "./component/ProcessList";
import ProcessSearch from "./component/ProcessSearch";
import ShiftSettings from "./component/ShiftSettings";
import HolidayCalendar from "./component/HolidayCalendar";
import Dashboard from "./component/Dashboard";
import Placeholder from "./component/Placeholder";
import InvoiceFilter from "./component/InvoiceFilter";

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");

  const handleLogin = (userData) => {
    setUser(userData);
    setActiveTab("Home");
  };

  return (
    <Router>
      <div className="App">
        <WindowControls />
        <div className="app-main">
          {user && <Header activeTab={activeTab} setActiveTab={setActiveTab} />}
          <div className="app-content">
            {user && (
              <Sidebar user={user} setUser={setUser} activeTab={activeTab} />
            )}
            <main className="main-content">
              <Routes>
                {!user && (
                  <>
                    <Route
                      path="/login"
                      element={<Login setUser={handleLogin} />}
                    />
                    <Route path="/signup" element={<Signup />} />{" "}
                  </>
                )}

                {user ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/notifications"
                      element={<Placeholder title="Notifications" />}
                    />
                    <Route
                      path="/add-plan"
                      element={<Placeholder title="Add Plan" />}
                    />
                    <Route
                      path="/view-plan"
                      element={<Placeholder title="View Plan" />}
                    />
                    <Route path="/add-machine" element={<AddMachine />} />
                    <Route path="/product-master" element={<ProductMaster />} />
                    <Route path="/shift-settings" element={<ShiftSettings />} />
                    <Route
                      path="/holiday-calendar"
                      element={<HolidayCalendar />}
                    />
                    <Route path="/add-component" element={<AddComponent />} />
                    <Route path="/list-comapany" element={<CompanyList />} />
                    <Route path="/add-process" element={<AddProcess />} />
                    <Route path="/processes" element={<ProcessList />} />
                    <Route
                      path="/search-processes"
                      element={<ProcessSearch />}
                    />
                    <Route
                      path="/machine-schedule/:id"
                      element={<WeeklyMachineSchedule />}
                    />
                    <Route path="/add-plan" element={<InvoiceFilter />} />
                  </>
                ) : (
                  <Route path="*" element={<Login setUser={handleLogin} />} />
                )}
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
