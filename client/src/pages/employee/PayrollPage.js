import React, { useEffect, useState } from 'react';
import { payrollAPI } from '../../services/payrollService';
import './PayrollPage.css';

const PayrollPage = () => {
  const [payrollList, setPayrollList] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollAPI.getMyPayroll();
      if (Array.isArray(data)) {
        setPayrollList(data);
        if (data.length > 0) setSelectedPayroll(data[0]);
      } else if (data) {
        setPayrollList([data]);
        setSelectedPayroll(data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load payroll records' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="payroll-container"><p>Loading payroll records...</p></div>;
  }

  return (
    <div className="payroll-container">
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {payrollList.length === 0 ? (
        <div className="payroll-card">
          <p className="no-data">No payroll records found</p>
        </div>
      ) : (
        <>
          {/* Payroll Records List */}
          <div className="payroll-card">
            <h3>Payroll History</h3>
            <div className="payroll-list">
              {payrollList.map((pr) => (
                <div
                  key={pr._id}
                  className={`payroll-item ${selectedPayroll?._id === pr._id ? 'active' : ''}`}
                  onClick={() => setSelectedPayroll(pr)}
                >
                  <div className="payroll-item-header">
                    <span className="period">{pr.payPeriod}</span>
                    <span className="amount">₹{pr.netPay?.toLocaleString() || 0}</span>
                  </div>
                  <p className="date">{new Date(pr.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Salary Slip */}
          {selectedPayroll && (
            <div className="payroll-card salary-slip">
              <h3>Salary Details - {selectedPayroll.payPeriod}</h3>

              {/* Earnings Section */}
              <div className="salary-section">
                <h4>Earnings</h4>
                <div className="salary-detail">
                  <span className="label">Basic Salary</span>
                  <span className="value">₹{selectedPayroll.baseSalary?.toLocaleString() || 0}</span>
                </div>
                <div className="salary-detail">
                  <span className="label">Allowances</span>
                  <span className="value">₹{selectedPayroll.allowances?.toLocaleString() || 0}</span>
                </div>
                <div className="salary-detail total">
                  <span className="label">Gross Pay</span>
                  <span className="value">₹{selectedPayroll.grossPay?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="salary-section">
                <h4>Deductions</h4>
                <div className="salary-detail">
                  <span className="label">Deductions</span>
                  <span className="value">₹{selectedPayroll.deductions?.toLocaleString() || 0}</span>
                </div>
                <div className="salary-detail total">
                  <span className="label">Net Pay</span>
                  <span className="value highlight">₹{selectedPayroll.netPay?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Additional Info */}
              {selectedPayroll.notes && (
                <div className="salary-section">
                  <h4>Notes</h4>
                  <p className="notes-text">{selectedPayroll.notes}</p>
                </div>
              )}

              {/* Effective Date */}
              <div className="salary-footer">
                <p className="footer-text">
                  Effective Date: {new Date(selectedPayroll.effectiveDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayrollPage;