import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  TimePicker,
  Card,
  Typography,
  Divider,
  notification,
  Table,
  Space,
  Row,
  Col,
  Popconfirm,
  InputNumber,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import "../style/ShiftSettings.css";

const { Title } = Typography;

const ShiftSettings = () => {
  const [form] = Form.useForm();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const data = await window.shiftAPI.getShifts();
      setShifts(data);
    } catch (error) {
      notification.error({ message: "Failed to load shifts" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values) => {
    const shiftData = {
      ...editingShift,
      ...values,
      id: editingShift?.id || `shift_${Date.now()}`,
      startTime: values.startTime.format("HH:mm"),
      endTime: values.endTime.format("HH:mm"),
      breaks:
        values.breaks?.map((b) => ({
          ...b,
          id: b.id || `break_${Date.now()}_${Math.random()}`,
        })) || [],
    };

    try {
      await window.shiftAPI.saveShift(shiftData);
      notification.success({ message: "Shift saved successfully" });
      loadShifts();
      handleCancelEdit();
    } catch (error) {
      notification.error({ message: "Failed to save shift" });
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    form.setFieldsValue({
      ...shift,
      startTime: moment(shift.startTime, "HH:mm"),
      endTime: moment(shift.endTime, "HH:mm"),
    });
  };

  const handleDeleteShift = async (id) => {
    try {
      await window.shiftAPI.deleteShift(id);
      notification.success({ message: "Shift deleted successfully" });
      loadShifts();
      if (editingShift?.id === id) {
        handleCancelEdit();
      }
    } catch (error) {
      notification.error({ message: "Failed to delete shift" });
    }
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    { title: "Start Time", dataIndex: "startTime", key: "startTime" },
    { title: "End Time", dataIndex: "endTime", key: "endTime" },
    {
      title: "Breaks",
      key: "breaks",
      render: (s) => s.breaks?.length || 0,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditShift(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this shift?"
            onConfirm={() => handleDeleteShift(record.id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="shift-settings-page">
      <Row gutter={24}>
        <Col span={14}>
          <Card>
            <Title level={4}>Company Shifts</Title>
            <Table
              loading={loading}
              columns={columns}
              dataSource={shifts}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => handleEditShift(record),
                style: { cursor: "pointer" },
              })}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card
            className="shift-form-card"
            title={
              <Title level={4}>
                {editingShift
                  ? `Editing: ${editingShift.name}`
                  : "Create a New Shift"}
              </Title>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Shift Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter a shift name" },
                ]}
              >
                <Input placeholder="e.g., Morning Shift, Night Shift" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Start Time"
                    name="startTime"
                    rules={[{ required: true }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="End Time"
                    name="endTime"
                    rules={[{ required: true }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Breaks</Divider>

              <Form.List name="breaks">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="break-list-item">
                        <Row gutter={16} style={{ width: "100%" }}>
                          <Col span={14}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              label="Break Name"
                              rules={[
                                { required: true, message: "Name is required" },
                              ]}
                            >
                              <Input placeholder="e.g., Lunch" />
                            </Form.Item>
                          </Col>
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "duration"]}
                              label="Duration (mins)"
                              rules={[
                                {
                                  required: true,
                                  message: "Duration is required",
                                },
                              ]}
                            >
                              <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <DeleteOutlined
                          className="remove-break-button"
                          onClick={() => remove(name)}
                        />
                      </div>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add a Break
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <div className="form-actions">
                {editingShift && (
                  <Button onClick={handleCancelEdit}>Cancel</Button>
                )}
                <Button type="primary" htmlType="submit">
                  {editingShift ? "Save Changes" : "Create Shift"}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShiftSettings;
