import React from "react";
import { Empty } from "antd";
import { FiInbox } from "react-icons/fi";

const Placeholder = ({ title }) => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    flexDirection: "column",
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    margin: "24px",
  };

  return (
    <div style={containerStyle}>
      <Empty
        image={<FiInbox style={{ fontSize: "60px", color: "#1890ff" }} />}
        imageStyle={{ height: 80 }}
        description={
          <>
            <h1>{title || "Page Not Found"}</h1>
            <p>
              This feature is currently under construction. Please check back
              later!
            </p>
          </>
        }
      />
    </div>
  );
};

export default Placeholder;
