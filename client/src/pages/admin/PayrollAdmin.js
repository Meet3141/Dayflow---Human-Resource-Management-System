import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { payrollAPI } from '../../services/payrollService';
import '../admin/PayrollAdmin.css';

const PayrollAdmin = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    payPeriod: '',
    baseSalary: '',
    allowances: '',
    deductions: '',
    notes: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.data.status === 'success') {
        const emps = res.data.data.filter((e) => e.role === 'employee');
        setEmployees(emps);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load employees' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollForEmployee = async (empId) => {
    setLoading(true);
    try {
      const data = await payrollAPI.getUserPayroll(empId);
      if (Array.isArray(data)) {
        setPayrollRecords(data);
        if (data.length > 0) setSelectedRecord(data[0]);
      } else if (data) {
        setPayrollRecords([data]);
        setSelectedRecord(data);
      } else {
        setPayrollRecords([]);
        setSelectedRecord(null);
      }
      setEditMode(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load payroll records' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    loadPayrollForEmployee(emp._id);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      payPeriod: record.payPeriod,
      baseSalary: record.baseSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      notes: record.notes || '',
    });
    setEditMode(true);
  };

  const handleCreateNew = () => {
    setFormData({
      payPeriod: new Date().toISOString().slice(0, 7),
      baseSalary: '',
      allowances: '',
      deductions: '',
      notes: '',
    });
    setSelectedRecord(null);
    setEditMode(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setMessage({ type: 'error', text: 'Please select an employee' });
      return;
    }

    if (!formData.payPeriod || !formData.baseSalary) {
      setMessage({ type: 'error', text: 'Pay Period and Base Salary are required' });
      return;
    }

    try {
      const payload = {
        payPeriod: formData.payPeriod,
        baseSalary: parseFloat(formData.baseSalary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        notes: formData.notes,
      };

      await payrollAPI.updateSalary(selectedEmployee._id, payload);
      setMessage({ type: 'success', text: 'Payroll record updated successfully' });
      loadPayrollForEmployee(selectedEmployee._id);
      setEditMode(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save payroll' });
    }
  };

  if (loading && !selectedEmployee) {
    return <div className="payroll-admin-container"><p>Loading...</p></div>;
  }

  return (
    <div className="payroll-admin-container">
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="payroll-admin-grid">
        {/* Employee List */}
        <div className="employee-panel">
          <div className="panel-header">
            <h3>Employees</h3>
          </div>
          <div className="employee-list">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className={`employee-item ${selectedEmployee?._id === emp._id ? 'active' : ''}`}
                onClick={() => handleSelectEmployee(emp)}
              >
                <p className="emp-name">{emp.name}</p>
                <p className="emp-id">{emp.employeeId}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll Management */}
        <div className="payroll-panel">
          {selectedEmployee ? (
            <>
              <div className="panel-header">
                <h3>{selectedEmployee.name} - Payroll</h3>
              </div>

              {editMode ? (
                <form onSubmit={handleSavePayroll} className="payroll-form">
                  <div className="form-group">
                    <label>Pay Period (YYYY-MM)</label>
                    <input
                      type="month"
                      name="payPeriod"
                      value={formData.payPeriod}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Base Salary</label>
                      <input
                        type="number"
                        name="baseSalary"
                        value={formData.baseSalary}
                        onChange={handleFormChange}
                        placeholder="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Allowances</label>
                      <input
                        type="number"
                        name="allowances"
                        value={formData.allowances}
                        onChange={handleFormChange}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Deductions</label>
                      <input
                        type="number"
                        name="deductions"
                        value={formData.deductions}
                        onChange={handleFormChange}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Any additional notes..."
                      rows="3"
                    />
                  </div>

                  {/* Auto-calculated values */}
                  <div className="calculated-values">
                    <div className="calc-row">
                      <span>Gross Pay:</span>
                      <span className="value">
                        ₹{(
                          (parseFloat(formData.baseSalary) || 0) +
                          (parseFloat(formData.allowances) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="calc-row highlight">
                      <span>Net Pay:</span>
                      <span className="value">
                        ₹{(
                          (parseFloat(formData.baseSalary) || 0) +
                          (parseFloat(formData.allowances) || 0) -
                          (parseFloat(formData.deductions) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-save">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancel"
                      onClick={() => {
                        setEditMode(false);
                        setSelectedRecord(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {payrollRecords.length === 0 ? (
                    <div className="no-records">
                      <p>No payroll records found</p>
                      <button onClick={handleCreateNew} className="btn btn-primary">
                        + Create New Payroll
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="payroll-records">
                        {payrollRecords.map((pr) => (
                          <div
                            key={pr._id}
                            className={`record-item ${selectedRecord?._id === pr._id ? 'active' : ''}`}
                            onClick={() => setSelectedRecord(pr)}
                          >
                            <div className="record-header">
                              <span className="period">{pr.payPeriod}</span>
                              <span className="net-pay">₹{pr.netPay?.toLocaleString() || 0}</span>
                            </div>
                            <p className="record-date">
                              {new Date(pr.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {selectedRecord && (
                        <div className="record-details">
                          <h4>Payroll Details - {selectedRecord.payPeriod}</h4>

                          <div className="detail-section">
                            <h5>Earnings</h5>
                            <div className="detail-row">
                              <span>Base Salary:</span>
                              <span>₹{selectedRecord.baseSalary?.toLocaleString() || 0}</span>
                            </div>
                            <div className="detail-row">
                              <span>Allowances:</span>
                              <span>₹{selectedRecord.allowances?.toLocaleString() || 0}</span>
                            </div>
                            <div className="detail-row total">
                              <span>Gross Pay:</span>
                              <span>₹{selectedRecord.grossPay?.toLocaleString() || 0}</span>
                            </div>
                          </div>

                          <div className="detail-section">
                            <h5>Deductions</h5>
                            <div className="detail-row">
                              <span>Deductions:</span>
                              <span>₹{selectedRecord.deductions?.toLocaleString() || 0}</span>
                            </div>
                            <div className="detail-row total highlight">
                              <span>Net Pay:</span>
                              <span>₹{selectedRecord.netPay?.toLocaleString() || 0}</span>
                            </div>
                          </div>

                          {selectedRecord.notes && (
                            <div className="detail-section">
                              <h5>Notes</h5>
                              <p className="notes">{selectedRecord.notes}</p>
                            </div>
                          )}

                          <div className="action-buttons">
                            <button onClick={() => handleEditRecord(selectedRecord)} className="btn btn-primary">
                              Edit
                            </button>
                          </div>
                        </div>
                      )}

                      <button onClick={handleCreateNew} className="btn btn-secondary">
                        + Create New Payroll
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Select an employee to view and manage payroll</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollAdmin;
