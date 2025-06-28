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
  Table,
  Avatar,
  Badge,
  Divider,
} from "antd";
import { Gauge, Heatmap, Line, Pie, Bar, Column } from "@ant-design/charts";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  AlertOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  SettingOutlined,
  BarChartOutlined,
  LineChartOutlined,
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
        orderStatus,
        shiftPerformance,
        qualityAlerts,
        companyOrderStats,
        holidayStats,
        machineStatusDistribution,
        processStats,
      ] = await Promise.all([
        window.dashboardAPI.getProductionMetrics(),
        window.dashboardAPI.getMachineStatus(),
        window.dashboardAPI.getOrderStatus(),
        window.dashboardAPI.getShiftPerformance(),
        window.dashboardAPI.getQualityAlerts(),
        window.dashboardAPI.getCompanyOrderStats(),
        window.dashboardAPI.getHolidayStats(),
        window.dashboardAPI.getMachineStatusDistribution(),
        window.dashboardAPI.getProcessStats(),
      ]);

      setData({
        productionMetrics,
        machineStatus,
        orderStatus,
        shiftPerformance,
        qualityAlerts,
        companyOrderStats,
        holidayStats,
        machineStatusDistribution,
        processStats,
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

  const {
    productionMetrics,
    machineStatus,
    orderStatus,
    shiftPerformance,
    qualityAlerts,
    companyOrderStats,
    holidayStats,
    machineStatusDistribution,
    processStats,
  } = data || {};

  // Company stats table columns
  const companyColumns = [
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar style={{ backgroundColor: "#1890ff" }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      render: (value) => (
        <Badge count={value} showZero style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Completed",
      dataIndex: "completedOrders",
      key: "completedOrders",
      render: (value) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {value}
        </Tag>
      ),
    },
    {
      title: "In Progress",
      dataIndex: "inProgressOrders",
      key: "inProgressOrders",
      render: (value) => (
        <Tag color="blue" icon={<ClockCircleOutlined />}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Pending",
      dataIndex: "pendingOrders",
      key: "pendingOrders",
      render: (value) => (
        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Completion Rate",
      dataIndex: "completionRate",
      key: "completionRate",
      render: (value) => (
        <Progress
          percent={Math.round(value)}
          size="small"
          status={
            value >= 80 ? "success" : value >= 60 ? "normal" : "exception"
          }
        />
      ),
    },
  ];

  // Generate machine status distribution data
  const getMachineStatusData = () => {
    return machineStatusDistribution || [];
  };

  // Generate order trends data (last 7 days)
  const getOrderTrendsData = () => {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // This would be populated with real order data
      trends.push({
        date: dateStr,
        orders: Math.floor(Math.random() * 10) + 1, // Placeholder - replace with real data
      });
    }
    return trends;
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <BarChartOutlined className="title-icon" />
            Warehouse Management Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Real-time insights into your production operations
          </p>
        </div>
        <div className="header-actions">
          <Tag color="blue" icon={<LineChartOutlined />}>
            Live Data
          </Tag>
        </div>
      </div>

      {/* Top: Key Metrics Summary */}
      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <div className="metric-content">
                <div className="metric-icon daily-production">
                  <TrophyOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    title="Daily Production"
                    value={productionMetrics?.dailyOutput || 0}
                    precision={0}
                    valueStyle={{
                      color:
                        (productionMetrics?.dailyOutput || 0) >=
                        (productionMetrics?.target || 0)
                          ? "#10b981"
                          : "#ef4444",
                    }}
                    prefix={
                      (productionMetrics?.dailyOutput || 0) >=
                      (productionMetrics?.target || 0) ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )
                    }
                    suffix="orders"
                  />
                </div>
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <div className="metric-content">
                <div className="metric-icon weekly-output">
                  <LineChartOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    title="Weekly Output"
                    value={productionMetrics?.weeklyOutput || 0}
                    precision={0}
                    suffix="orders"
                  />
                </div>
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <div className="metric-content">
                <div className="metric-icon utilization">
                  <SettingOutlined />
                </div>
                <div className="metric-details">
                  <div className="gauge-container">
                    <Gauge
                      percent={productionMetrics?.utilization || 0}
                      range={{
                        color: "l(0) 0:#B8E1FF 1:#3D76DD",
                      }}
                      startAngle={Math.PI}
                      endAngle={2 * Math.PI}
                      height={80}
                      axis={{
                        label: {
                          formatter: (v) => `${(v * 100).toFixed(0)}%`,
                        },
                      }}
                    />
                    <div className="gauge-title">Machine Utilization</div>
                  </div>
                </div>
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
              <div className="metric-content">
                <div className="metric-icon alerts">
                  <AlertOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    title="Active Alerts"
                    value={qualityAlerts?.length || 0}
                    valueStyle={{
                      color:
                        (qualityAlerts?.length || 0) > 0
                          ? "#ef4444"
                          : "#10b981",
                    }}
                    prefix={<AlertOutlined />}
                  />
                </div>
              </div>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Company Performance Section */}
      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24} lg={16}>
          <Card
            className="company-card"
            title={
              <span className="card-title">
                <TeamOutlined className="title-icon" />
                Company Performance Overview
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {companyOrderStats && companyOrderStats.length > 0 ? (
                <Table
                  dataSource={companyOrderStats}
                  columns={companyColumns}
                  pagination={false}
                  size="small"
                  rowKey="companyId"
                  className="company-table"
                />
              ) : (
                <Empty description="No company data available" />
              )}
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            className="holiday-card"
            title={
              <span className="card-title">
                <CalendarOutlined className="title-icon" />
                Holiday Overview
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {holidayStats ? (
                <div className="holiday-stats">
                  <div className="holiday-stat-item">
                    <Statistic
                      title="This Month"
                      value={holidayStats.currentMonthHolidays}
                      prefix={<CalendarOutlined />}
                    />
                  </div>
                  <Divider />
                  <div className="holiday-stat-item">
                    <Statistic
                      title="Upcoming (30 days)"
                      value={holidayStats.upcomingHolidays}
                      prefix={<CalendarOutlined />}
                    />
                  </div>
                  <Divider />
                  <div className="holiday-stat-item">
                    <Statistic
                      title="Total Holidays"
                      value={holidayStats.totalHolidays}
                      prefix={<CalendarOutlined />}
                    />
                  </div>
                  {holidayStats.nextHoliday && (
                    <div className="next-holiday-info">
                      <div className="next-holiday-label">Next Holiday:</div>
                      <div className="next-holiday-name">
                        {holidayStats.nextHoliday.name}
                      </div>
                      <div className="next-holiday-date">
                        {new Date(
                          holidayStats.nextHoliday.date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Empty description="No holiday data available" />
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]} className="dashboard-section">
        {/* Machine Status Distribution */}
        <Col xs={24} lg={8}>
          <Card
            className="chart-card"
            title={
              <span className="card-title">
                <SettingOutlined className="title-icon" />
                Machine Status Distribution
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {machineStatusDistribution &&
              machineStatusDistribution.length > 0 ? (
                <Pie
                  data={getMachineStatusData()}
                  angleField="count"
                  colorField="status"
                  radius={0.8}
                  height={250}
                  legend={{ position: "bottom" }}
                  label={{
                    type: "inner",
                    content: "{percentage}",
                  }}
                  color={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]}
                />
              ) : (
                <Empty description="No machine data available" />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Order Status Distribution */}
        <Col xs={24} lg={8}>
          <Card
            className="chart-card"
            title={
              <span className="card-title">
                <BarChartOutlined className="title-icon" />
                Order Status Distribution
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {orderStatus && orderStatus.length > 0 ? (
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
                  color={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]}
                />
              ) : (
                <Empty description="No order data available" />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Shift Performance */}
        <Col xs={24} lg={8}>
          <Card
            className="chart-card"
            title={
              <span className="card-title">
                <ClockCircleOutlined className="title-icon" />
                Shift Performance
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {shiftPerformance && shiftPerformance.length > 0 ? (
                <Bar
                  data={shiftPerformance}
                  xField="output"
                  yField="shift"
                  seriesField="shift"
                  height={250}
                  legend={false}
                  color={["#3b82f6", "#10b981", "#f59e0b"]}
                />
              ) : (
                <Empty description="No shift data available" />
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Process Performance Section */}
      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24}>
          <Card
            className="chart-card"
            title={
              <span className="card-title">
                <SettingOutlined className="title-icon" />
                Process Performance Overview
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {processStats && processStats.length > 0 ? (
                <Column
                  data={processStats}
                  xField="processName"
                  yField="orderCount"
                  seriesField="status"
                  isGroup={true}
                  height={300}
                  legend={{ position: "top" }}
                  color={["#10b981", "#3b82f6", "#f59e0b"]}
                  tooltip={{
                    formatter: (datum) => ({
                      name:
                        datum.status === "completedOrders"
                          ? "Completed"
                          : datum.status === "inProgressOrders"
                          ? "In Progress"
                          : "Pending",
                      value: datum.orderCount,
                    }),
                  }}
                  transform={[
                    {
                      type: "fold",
                      fields: [
                        "completedOrders",
                        "inProgressOrders",
                        "pendingOrders",
                      ],
                      key: "status",
                      value: "orderCount",
                    },
                  ]}
                />
              ) : (
                <Empty description="No process data available" />
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Row gutter={[24, 24]} className="dashboard-section">
        {/* Machine Utilization Heatmap */}
        <Col xs={24} lg={12}>
          <Card
            className="chart-card"
            title={
              <span className="card-title">
                <SettingOutlined className="title-icon" />
                Machine Utilization by Hour
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {machineStatus && machineStatus.length > 0 ? (
                <Heatmap
                  data={machineStatus}
                  xField="hour"
                  yField="machine"
                  colorField="utilization"
                  height={300}
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
                <Empty description="No machine data available" />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Quality Alerts */}
        <Col xs={24} lg={12}>
          <Card
            className="alerts-card"
            title={
              <span className="card-title">
                <AlertOutlined className="title-icon" />
                Live Quality Alerts
              </span>
            }
          >
            <Skeleton loading={loading} active>
              {qualityAlerts && qualityAlerts.length > 0 ? (
                <List
                  dataSource={qualityAlerts}
                  itemLayout="horizontal"
                  className="alerts-list"
                  renderItem={(item) => (
                    <List.Item className="alert-item">
                      <List.Item.Meta
                        avatar={
                          <AlertOutlined
                            className={`alert-icon ${item.severity.toLowerCase()}`}
                          />
                        }
                        title={
                          <div className="alert-title">
                            <span>{item.machine}</span>
                            <Tag
                              color={
                                item.severity === "High" ? "volcano" : "warning"
                              }
                              className="severity-tag"
                            >
                              {item.severity}
                            </Tag>
                          </div>
                        }
                        description={
                          <div className="alert-description">
                            <div className="alert-code">{item.code}</div>
                            <div className="alert-message">
                              {item.description}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="operational-status">
                  <CheckCircleOutlined className="status-icon" />
                  <div className="status-text">All systems operational</div>
                </div>
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
