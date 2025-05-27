import React, { useEffect, useState } from "react";
import "../style/companylist.css";
import { useNavigate, useParams } from "react-router-dom";
const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    window.machineAPI
      .getCompanies()
      .then((data) => {
        setCompanies(data);
      })
      .catch(() => {
        setError("Failed to fetch companies data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const routeWithData = (id) => {
    navigate(`/machine-schedule/${id}`);
  };
  if (loading) return <div className='loading'>Loading...</div>;
  if (error) return <div className='error'>{error}</div>;

  return (
    <>
      <div className='company-list'>
        {companies &&
          companies?.map((company, index) => (
            <div
              key={index}
              className='company-card'
              onClick={() => routeWithData(company?.id)}
            >
              <h2>{company?.name}</h2>
              <p>
                <strong>Address:</strong> {company?.address}
              </p>
              {/* <p>
            <strong>GST:</strong> {company.gst}
          </p>
          <p>
            <strong>Quantity:</strong> {company.quantity}
          </p> */}
              <p>
                <strong>Start:</strong>{" "}
                {new Date(company?.startDateTime).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {new Date(company?.endDateTime).toLocaleString()}
              </p>
              <p>
                <strong>Daily Hours:</strong> {company?.dailyHours}
              </p>

              {/* <div className='machine-section'>
            <h4>Machines:</h4>
            {company.machines.map((machine, idx) => (
              <div key={idx} className='machine-item'>
                <p>
                  <strong>Name:</strong> {machine.name}
                </p>
                <p>
                  <strong>Time per Unit:</strong> {machine.timePerUnit}
                </p>
              </div>
            ))}
          </div> */}
            </div>
          ))}
      </div>
    </>
  );
};

export default CompanyList;
