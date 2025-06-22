import React, { useState, useEffect } from "react";
import {
  Calendar,
  Badge,
  Card,
  Typography,
  notification,
  Popconfirm,
  Modal,
  Form,
  Input,
  Tooltip,
  Row,
  Col,
  List,
  Avatar,
  Button,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import "../style/HolidayCalendar.css";

const { Title, Text } = Typography;

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [currentMonthHolidays, setCurrentMonthHolidays] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadHolidays();
  }, []);

  useEffect(() => {
    const monthHolidays = holidays
      .filter((h) => moment(h.date).isSame(currentDate, "month"))
      .sort((a, b) => moment(a.date).date() - moment(b.date).date());
    setCurrentMonthHolidays(monthHolidays);
  }, [holidays, currentDate]);

  const loadHolidays = async () => {
    try {
      const data = await window.holidayAPI.getHolidays();
      setHolidays(data);
    } catch (error) {
      notification.error({ message: "Failed to load holidays" });
    }
  };

  const handleSelectDate = (date) => {
    if (date.day() === 0) return; // Disable selecting Sundays
    const dateString = date.format("YYYY-MM-DD");
    const existing = holidays.find((h) => h.date === dateString);
    if (!existing) {
      setCurrentDate(date);
      form.setFieldsValue({ description: "" });
      setModalVisible(true);
    }
  };

  const handleSaveHoliday = async () => {
    const values = await form.validateFields();
    const holidayData = {
      id: `holiday_${currentDate.valueOf()}`,
      date: currentDate.format("YYYY-MM-DD"),
      description: values.description,
    };
    await window.holidayAPI.saveHoliday(holidayData);
    notification.success({ message: "Holiday saved." });
    loadHolidays();
    setModalVisible(false);
  };

  const handleDeleteHoliday = async (id) => {
    await window.holidayAPI.deleteHoliday(id);
    notification.success({ message: "Holiday deleted." });
    loadHolidays();
  };

  const dateCellRender = (value) => {
    const dateString = value.format("YYYY-MM-DD");
    const holiday = holidays.find((h) => h.date === dateString);
    return holiday ? (
      <div className="holiday-badge-wrapper">
        <Tooltip title={holiday.description}>
          <Badge status="error" className="holiday-badge" />
        </Tooltip>
      </div>
    ) : null;
  };

  const disabledDate = (current) => {
    return current && current.day() === 0;
  };

  const cellRender = (current, info) => {
    if (info.type !== "date" || !info.originNode) {
      return info.originNode;
    }

    const isSunday = current.day() === 0;
    const holidayBadge = dateCellRender(current);

    const existingClassName = info.originNode.props.className || "";
    const newClassName = isSunday
      ? `${existingClassName} sunday-cell`
      : existingClassName;

    // The badge is positioned absolutely, so it can be a sibling to the original content
    const newChildren = (
      <>
        {holidayBadge}
        {info.originNode.props.children}
      </>
    );

    return React.cloneElement(info.originNode, {
      className: newClassName,
      children: newChildren,
    });
  };

  return (
    <Card
      className="holiday-calendar-card"
      title={<Title level={4}>Company Holiday & Shift Calendar</Title>}
    >
      <Row>
        <Col span={16} className="holiday-calendar-container">
          <Calendar
            cellRender={cellRender}
            onSelect={handleSelectDate}
            onPanelChange={(date) => setCurrentDate(date)}
            disabledDate={disabledDate}
          />
        </Col>
        <Col span={8} className="holiday-list">
          <Title level={5}>{currentDate.format("MMMM YYYY")} Holidays</Title>
          <List
            itemLayout="horizontal"
            dataSource={currentMonthHolidays}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Delete this holiday?"
                    onConfirm={() => handleDeleteHoliday(item.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: "#ff4d4f" }}>
                      {moment(item.date).format("DD")}
                    </Avatar>
                  }
                  title={item.description}
                  description={moment(item.date).format("dddd")}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>

      <Modal
        title={`Add Holiday for ${currentDate?.format("LL")}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSaveHoliday}
        okText="Save Holiday"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="description"
            label="Holiday Name / Description"
            rules={[{ required: true }]}
          >
            <Input placeholder="E.g., Christmas Day" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default HolidayCalendar;
