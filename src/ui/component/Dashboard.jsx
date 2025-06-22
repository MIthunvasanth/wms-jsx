import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Skeleton,
  Empty,
  List,
  Tag,
  Tooltip,
} from "antd";
import { Gauge, Heatmap, Line, Pie, Bar } from "@ant-design/charts";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import "../style/Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const [
        productionMetrics,
        machineStatus,
        defectTrends,
        orderStatus,
        shiftPerformance,
        qualityAlerts,
      ] = await Promise.all([
        window.dashboardAPI.getProductionMetrics(),
        window.dashboardAPI.getMachineStatus(),
        window.dashboardAPI.getDefectTrends(),
        window.dashboardAPI.getOrderStatus(),
        window.dashboardAPI.getShiftPerformance(),
        window.dashboardAPI.getQualityAlerts(),
      ]);

      setData({
        productionMetrics,
        machineStatus,
        defectTrends,
        orderStatus,
        shiftPerformance,
        qualityAlerts,
      });
    } catch (err) {
      setError(
        "Failed to fetch dashboard data. The backend service may not be running."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  console.log(data);
  const {
    productionMetrics,
    machineStatus,
    defectTrends,
    orderStatus,
    shiftPerformance,
    qualityAlerts,
  } = data || {};

  return (
    <div className="dashboard-container">
      {/* Top: Key Metrics Summary */}
      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <Statistic
                title="Daily Production"
                value={productionMetrics?.dailyOutput}
                precision={0}
                valueStyle={{
                  color:
                    productionMetrics?.dailyOutput >= productionMetrics?.target
                      ? "#3f8600"
                      : "#cf1322",
                }}
                prefix={
                  productionMetrics?.dailyOutput >=
                  productionMetrics?.target ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                }
                suffix="units"
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <Statistic
                title="Weekly Output"
                value={productionMetrics?.weeklyOutput}
                precision={0}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <div className="gauge-container">
                <Gauge
                  percent={productionMetrics?.utilization || 0}
                  range={{
                    color: "l(0) 0:#B8E1FF 1:#3D76DD",
                  }}
                  startAngle={Math.PI}
                  endAngle={2 * Math.PI}
                  height={120}
                  axis={{
                    label: {
                      formatter: (v) => `${(v * 100).toFixed(0)}%`,
                    },
                  }}
                />
                <div className="gauge-title">Overall Utilization</div>
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <Statistic
                title="Active Alerts"
                value={qualityAlerts?.length || 0}
                valueStyle={{
                  color:
                    (qualityAlerts?.length || 0) > 0 ? "#cf1322" : "#3f8600",
                }}
                prefix={<AlertOutlined />}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-section">
        {/* Left: Production/Defect Timeline */}
        <Col xs={24} lg={12}>
          <Card title="Defect Rate Trend">
            <Skeleton loading={loading} active>
              {defectTrends ? (
                <Line
                  data={defectTrends}
                  xField="date"
                  yField="rate"
                  height={250}
                  yAxis={{
                    label: {
                      formatter: (v) => `${(v * 100).toFixed(1)}%`,
                    },
                  }}
                  tooltip={{
                    formatter: (datum) => ({
                      name: "Defect Rate",
                      value: `${(datum.rate * 100).toFixed(2)}%`,
                    }),
                  }}
                />
              ) : (
                <Empty />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Center: Machine Status Grid */}
        <Col xs={24} lg={12}>
          <Card title="Machine Utilization by Hour">
            <Skeleton loading={loading} active>
              {machineStatus ? (
                <Heatmap
                  data={machineStatus}
                  xField="hour"
                  yField="machine"
                  colorField="utilization"
                  height={250}
                  color={[
                    "#d6e4ff",
                    "#b8e1ff",
                    "#8baadd",
                    "#588add",
                    "#3d76dd",
                  ]}
                  tooltip={{
                    title: (d) => `${d.machine} at ${d.hour}`,
                    formatter: (datum) => ({
                      name: "Utilization",
                      value: `${(datum.utilization * 100).toFixed(0)}%`,
                    }),
                  }}
                />
              ) : (
                <Empty />
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-section">
        {/* Bottom Left: Order Status */}
        <Col xs={24} lg={8}>
          <Card title="Order Status">
            <Skeleton loading={loading} active>
              {orderStatus ? (
                <Pie
                  data={orderStatus}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  height={250}
                  legend={{ position: "bottom" }}
                  label={{
                    type: "inner",
                    content: "{percentage}",
                  }}
                />
              ) : (
                <Empty />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Bottom Center: Shift Comparison */}
        <Col xs={24} lg={8}>
          <Card title="Shift Performance">
            <Skeleton loading={loading} active>
              {shiftPerformance ? (
                <Bar
                  data={shiftPerformance}
                  xField="output"
                  yField="shift"
                  seriesField="shift"
                  height={250}
                  legend={false}
                />
              ) : (
                <Empty />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Bottom Right: Quality Alerts */}
        <Col xs={24} lg={8}>
          <Card title="Live Quality Alerts">
            <Skeleton loading={loading} active>
              {qualityAlerts ? (
                <List
                  dataSource={qualityAlerts}
                  itemLayout="horizontal"
                  className="alerts-list"
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <AlertOutlined
                            style={{
                              color:
                                item.severity === "High" ? "red" : "orange",
                            }}
                          />
                        }
                        title={
                          <>
                            {item.machine}{" "}
                            <Tag
                              color={
                                item.severity === "High" ? "volcano" : "warning"
                              }
                            >
                              {item.severity}
                            </Tag>
                          </>
                        }
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty />
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
