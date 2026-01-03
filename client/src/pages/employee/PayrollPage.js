import React, { useEffect, useState } from 'react';
import { payrollAPI } from '../../services/payrollService';
import { useAuth } from '../../contexts/AuthContext';

const PayrollPage = () => {
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p) => {
    setLoading(true);
    try {
      const data = await payrollAPI.getMyPayroll(p);
      setRecord(data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(period); };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>Payroll</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="YYYY-MM" value={period} onChange={(e) => setPeriod(e.target.value)} />
        <button type="submit">Fetch</button>
      </form>

      {loading ? <p>Loading...</p> : (
        record ? (
          <div style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
            <p><strong>Pay Period:</strong> {record.payPeriod}</p>
            <p><strong>Base:</strong> {record.baseSalary}</p>
            <p><strong>Allowances:</strong> {record.allowances}</p>
            <p><strong>Deductions:</strong> {record.deductions}</p>
            <p><strong>Gross:</strong> {record.grossPay}</p>
            <p><strong>Net:</strong> {record.netPay}</p>
          </div>
        ) : <p>No payroll record found.</p>
      )}
    </div>
  );
};

export default PayrollPage;