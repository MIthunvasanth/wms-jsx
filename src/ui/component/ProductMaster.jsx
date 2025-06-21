import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Form,
  Input,
  Select,
  Space,
  Card,
  Typography,
  Divider,
  notification,
  Popconfirm,
  Steps,
  Modal,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;

const ProductMaster = () => {
  const [form] = Form.useForm();
  const [processForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("Available window APIs:", {
      productAPI: window.productAPI,
      machineAPI: window.machineAPI,
      electron: window.electron,
    });
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsData = await window.productAPI.getProducts();
      const machinesData = await window.machineAPI.loadMachines();
      setProducts(productsData);
      setMachines(machinesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      notification.error({
        message: "Failed to load data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await window.productAPI.updateProduct({ ...editingProduct, ...values });
        notification.success({ message: "Product updated successfully" });
      } else {
        const partNumber =
          values.partNumber || (await window.productAPI.generatePartNumber());
        await window.productAPI.createProduct({ ...values, partNumber });
        notification.success({ message: "Product created successfully" });
      }
      form.resetFields();
      setEditingProduct(null);
      loadData();
    } catch (error) {
      notification.error({
        message: "Operation failed",
        description: error.message,
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
  };

  const handleDelete = async (id) => {
    try {
      await window.productAPI.deleteProduct(id);
      notification.success({ message: "Product deleted successfully" });
      loadData();
    } catch (error) {
      notification.error({
        message: "Deletion failed",
        description: error.message,
      });
    }
  };

  const handleAddProcess = () => {
    setEditingProcess(null);
    processForm.resetFields();
    setProcessModalVisible(true);
  };

  const handleEditProcess = (step) => {
    setEditingProcess(step);
    processForm.setFieldsValue(step);
    setProcessModalVisible(true);
  };

  const handleProcessSubmit = async (values) => {
    if (!editingProduct) return;

    try {
      const stepData = {
        ...values,
        id: editingProcess?.id || `${Date.now()}`,
        sequence:
          editingProcess?.sequence ||
          (editingProduct.processFlow?.length || 0) + 1,
      };

      if (editingProcess) {
        await window.productAPI.updateProcessStep(editingProduct.id, stepData);
      } else {
        await window.productAPI.addProcessStep(editingProduct.id, stepData);
      }

      setProcessModalVisible(false);
      notification.success({ message: "Process step saved successfully" });
      loadData();
    } catch (error) {
      notification.error({
        message: "Failed to save process step",
        description: error.message,
      });
    }
  };

  const handleDeleteProcess = async (stepId) => {
    if (!editingProduct) return;

    try {
      await window.productAPI.deleteProcessStep(editingProduct.id, stepId);
      notification.success({ message: "Process step deleted successfully" });
      loadData();
    } catch (error) {
      notification.error({
        message: "Failed to delete process step",
        description: error.message,
      });
    }
  };

  const handleMoveProcess = async (step, direction) => {
    if (!editingProduct) return;

    try {
      const currentIndex = editingProduct.processFlow.findIndex(
        (p) => p.id === step.id
      );
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= editingProduct.processFlow.length) return;

      // Swap sequence numbers
      const updatedSteps = [...editingProduct.processFlow];
      [updatedSteps[currentIndex].sequence, updatedSteps[newIndex].sequence] = [
        updatedSteps[newIndex].sequence,
        updatedSteps[currentIndex].sequence,
      ];

      // Sort by sequence and update
      updatedSteps.sort((a, b) => a.sequence - b.sequence);
      await window.productAPI.updateProcessStep(
        editingProduct.id,
        updatedSteps[currentIndex]
      );
      await window.productAPI.updateProcessStep(
        editingProduct.id,
        updatedSteps[newIndex]
      );
      loadData();
    } catch (error) {
      notification.error({
        message: "Failed to move process step",
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Part Number",
      dataIndex: "partNumber",
      key: "partNumber",
    },
    {
      title: "Priority",
      dataIndex: "priorityLevel",
      key: "priorityLevel",
      render: (priority) => (
        <Tag
          color={
            priority === "High"
              ? "red"
              : priority === "Medium"
              ? "orange"
              : "green"
          }
        >
          {priority}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="product-master-container">
      <Card title={<Title level={4}>Product Master</Title>} loading={loading}>
        <div className="product-form-section">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ priorityLevel: "Medium" }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                name="productName"
                label="Product Name"
                rules={[
                  { required: true, message: "Please input product name" },
                ]}
                style={{ flex: 2 }}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>

              <Form.Item
                name="partNumber"
                label="Part Number"
                style={{ flex: 1 }}
              >
                <Input
                  placeholder="Auto-generated"
                  disabled={!!editingProduct}
                  addonAfter={
                    <Button
                      size="small"
                      onClick={async () => {
                        const partNumber =
                          await window.productAPI.generatePartNumber();
                        form.setFieldsValue({ partNumber });
                      }}
                    >
                      Generate
                    </Button>
                  }
                />
              </Form.Item>

              <Form.Item
                name="priorityLevel"
                label="Priority Level"
                style={{ flex: 1 }}
              >
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingProduct ? "Update" : "Create"} Product
                </Button>
                {editingProduct && (
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </div>

        <Divider />

        <div className="product-list-section">
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => handleEdit(record),
            })}
          />
        </div>

        {editingProduct && (
          <>
            <Divider orientation="left">Process Flow</Divider>
            <div className="process-flow-section">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProcess}
                style={{ marginBottom: 16 }}
              >
                Add Process Step
              </Button>

              {editingProduct.processFlow?.length > 0 ? (
                <Steps direction="vertical" current={-1}>
                  {editingProduct.processFlow
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((step) => {
                      const machine = machines.find(
                        (m) => m.id === step.machineId
                      );
                      return (
                        <Step
                          key={step.id}
                          title={step.processName}
                          description={
                            <div>
                              <Text strong>Machine: </Text>
                              <Text>{machine?.name || "Unknown"}</Text>
                              <br />
                              <Text strong>Cycle Time: </Text>
                              <Text>{step.cycleTime} seconds</Text>
                              <div style={{ marginTop: 8 }}>
                                <Space>
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditProcess(step);
                                    }}
                                  />
                                  <Button
                                    size="small"
                                    icon={<ArrowUpOutlined />}
                                    disabled={step.sequence === 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveProcess(step, "up");
                                    }}
                                  />
                                  <Button
                                    size="small"
                                    icon={<ArrowDownOutlined />}
                                    disabled={
                                      step.sequence ===
                                      editingProduct.processFlow.length
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveProcess(step, "down");
                                    }}
                                  />
                                  <Popconfirm
                                    title="Are you sure to delete this process step?"
                                    onConfirm={(e) => {
                                      e?.stopPropagation();
                                      handleDeleteProcess(step.id);
                                    }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <Button
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </Popconfirm>
                                </Space>
                              </div>
                            </div>
                          }
                        />
                      );
                    })}
                </Steps>
              ) : (
                <Card>
                  <Text type="secondary">
                    No process steps defined for this product
                  </Text>
                </Card>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Process Step Modal */}
      <Modal
        title={`${editingProcess ? "Edit" : "Add"} Process Step`}
        visible={processModalVisible}
        onCancel={() => setProcessModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={processForm}
          layout="vertical"
          onFinish={handleProcessSubmit}
          initialValues={{ cycleTime: 30 }}
        >
          <Form.Item
            name="processName"
            label="Process Name"
            rules={[{ required: true, message: "Please input process name" }]}
          >
            <Input placeholder="Enter process name" />
          </Form.Item>

          <Form.Item
            name="machineId"
            label="Machine"
            rules={[{ required: true, message: "Please select a machine" }]}
          >
            <Select placeholder="Select machine">
              {machines.map((machine) => (
                <Option key={machine.id} value={machine.id}>
                  {machine.name} ({machine.type})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cycleTime"
            label="Cycle Time (seconds)"
            rules={[
              { required: true, message: "Please input cycle time" },
              {
                type: "number",
                min: 1,
                message: "Cycle time must be at least 1 second",
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Process Step
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductMaster;
