import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { BASE_URL } from '../../utils/config';
import {
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineCalendar,
  HiOutlineFilter,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const INCOME_CATEGORIES = [
  'Donation',
  'Grant',
  'Sponsorship',
  'Fundraiser Event',
  'Membership Fee',
  'Bank Interest',
  'Government Aid',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Books & Stationery',
  'Student Nutrition / Food',
  'Workshop & Events',
  'Venue & Rent',
  'Teacher / Mentor Stipend',
  'Travel & Logistics',
  'Printing & Marketing',
  'Legal & Administration',
  'Emergency Relief',
  'Other Expense',
];

const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Card', 'Other'];

const Expenses = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'this_month', 'last_month', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptModalUrl, setReceiptModalUrl] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'expense',
    amount: '',
    category: 'Books & Stationery',
    date: new Date().toISOString().split('T')[0],
    party: '',
    paymentMethod: 'UPI',
    reference: '',
    notes: '',
    status: 'Completed',
    receipt: null,
  });
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [typeFilter, categoryFilter, methodFilter, dateFilter, customStart, customEnd]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/expenses/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching expense stats:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (methodFilter !== 'All') params.paymentMethod = methodFilter;

      const now = new Date();
      if (dateFilter === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        params.startDate = start.toISOString().split('T')[0];
      } else if (dateFilter === 'last_month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        params.startDate = start.toISOString().split('T')[0];
        params.endDate = end.toISOString().split('T')[0];
      } else if (dateFilter === 'custom') {
        if (customStart) params.startDate = customStart;
        if (customEnd) params.endDate = customEnd;
      }

      if (searchTerm) params.search = searchTerm;

      const res = await API.get('/expenses', { params });
      setTransactions(res.data.expenses || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = (defaultType = 'expense') => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      type: defaultType,
      amount: '',
      category: defaultType === 'income' ? 'Donation' : 'Books & Stationery',
      date: new Date().toISOString().split('T')[0],
      party: '',
      paymentMethod: 'UPI',
      reference: '',
      notes: '',
      status: 'Completed',
      receipt: null,
    });
    setReceiptPreview(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tx) => {
    setIsEditing(true);
    setEditingId(tx._id);
    setFormData({
      title: tx.title || '',
      type: tx.type || 'expense',
      amount: tx.amount || '',
      category: tx.category || 'Other Expense',
      date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0],
      party: tx.party || '',
      paymentMethod: tx.paymentMethod || 'UPI',
      reference: tx.reference || '',
      notes: tx.notes || '',
      status: tx.status || 'Completed',
      receipt: null,
    });
    setReceiptPreview(tx.receipt ? (tx.receipt.startsWith('http') ? tx.receipt : `${BASE_URL}${tx.receipt}`) : null);
    setModalOpen(true);
  };

  // Handle Receipt Upload Change
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, receipt: file }));
      if (file.type.startsWith('image/')) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview(null);
      }
    }
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Please enter a title');
    if (!formData.amount || Number(formData.amount) <= 0) return toast.error('Please enter a valid amount');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('type', formData.type);
      data.append('amount', formData.amount);
      data.append('category', formData.category);
      data.append('date', formData.date);
      data.append('party', formData.party);
      data.append('paymentMethod', formData.paymentMethod);
      data.append('reference', formData.reference);
      data.append('notes', formData.notes);
      data.append('status', formData.status);
      if (formData.receipt) {
        data.append('receipt', formData.receipt);
      }

      if (isEditing) {
        await API.put(`/expenses/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Transaction updated successfully');
      } else {
        await API.post('/expenses', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} recorded successfully!`);
      }

      setModalOpen(false);
      fetchStats();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Transaction
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      await API.delete(`/expenses/${id}`);
      toast.success('Transaction deleted');
      fetchStats();
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (transactions.length === 0) return toast.info('No transactions to export');

    const dataToExport = transactions.map((t, idx) => ({
      'S.No': idx + 1,
      Date: new Date(t.date).toLocaleDateString('en-IN'),
      Type: t.type === 'income' ? 'INCOME (+)' : 'EXPENSE (-)',
      Title: t.title,
      Category: t.category,
      Party: t.party || '—',
      'Payment Mode': t.paymentMethod,
      'Reference / Bill No': t.reference || '—',
      'Amount (₹)': t.amount,
      Status: t.status,
      Notes: t.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expense_Ledger');
    XLSX.writeFile(wb, `EnVision_Expense_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully!');
  };

  const getFullUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  // Client search filter
  const displayedTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title?.toLowerCase().includes(term) ||
      t.party?.toLowerCase().includes(term) ||
      t.category?.toLowerCase().includes(term) ||
      t.reference?.toLowerCase().includes(term) ||
      t.notes?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="page">
      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2>Expense & Income Tracker</h2>
          <p>Real-time financial management — monitor funds received and expenses spent</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenAdd('income')}
            className="btn btn-success"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              fontWeight: 600,
            }}
          >
            <HiOutlineTrendingUp style={{ fontSize: '1.2rem' }} /> + Record Income
          </button>

          <button
            onClick={() => handleOpenAdd('expense')}
            className="btn btn-danger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              fontWeight: 600,
            }}
          >
            <HiOutlineTrendingDown style={{ fontSize: '1.2rem' }} /> + Record Expense
          </button>

          <button
            onClick={handleExportExcel}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Download Excel Spreadsheet"
          >
            <HiOutlineDownload /> Export Excel
          </button>
        </div>
      </div>

      {/* ── Top Metric Cards (Cash Flow Stats) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.2rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Total Inflow */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
            }}
          >
            <HiOutlineTrendingUp />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Income
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.65rem', color: '#10B981' }}>
              ₹{(stats?.totalIncome || 0).toLocaleString('en-IN')}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {stats?.incomeCount || 0} Inflow Transactions
            </span>
          </div>
        </div>

        {/* Total Outflow */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
            }}
          >
            <HiOutlineTrendingDown />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Expenses
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.65rem', color: '#EF4444' }}>
              ₹{(stats?.totalExpense || 0).toLocaleString('en-IN')}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {stats?.expenseCount || 0} Expense Vouchers
            </span>
          </div>
        </div>

        {/* Net Fund Balance */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: `4px solid ${(stats?.netBalance || 0) >= 0 ? '#3B82F6' : '#DC2626'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
            }}
          >
            <HiOutlineCurrencyRupee />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Net Balance
            </span>
            <h3
              style={{
                margin: '2px 0 0',
                fontSize: '1.65rem',
                color: (stats?.netBalance || 0) >= 0 ? '#3B82F6' : '#DC2626',
              }}
            >
              ₹{(stats?.netBalance || 0).toLocaleString('en-IN')}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {(stats?.netBalance || 0) >= 0 ? 'Surplus Available' : 'Deficit Alert'}
            </span>
          </div>
        </div>

        {/* This Month Snapshot */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
            }}
          >
            <HiOutlineCalendar />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              This Month
            </span>
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', fontWeight: 600 }}>IN</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10B981' }}>
                  ₹{(stats?.thisMonthIncome || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ borderLeft: '1px solid #CBD5E1', paddingLeft: '0.8rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#EF4444', display: 'block', fontWeight: 600 }}>OUT</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#EF4444' }}>
                  ₹{(stats?.thisMonthExpense || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Optional Category Breakdown Toggle ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <HiOutlineFilter /> {showCategoryBreakdown ? 'Hide Category Insights' : 'Show Category Breakdown'}
        </button>

        {showCategoryBreakdown && stats?.categoryBreakdown && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem',
            }}
          >
            {/* Expense Breakdown */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', color: '#EF4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HiOutlineTrendingDown /> Expense Distribution by Category
              </h4>
              {stats.categoryBreakdown.expense.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No expenses recorded yet.</p>
              ) : (
                stats.categoryBreakdown.expense.map((item) => {
                  const pct = stats.totalExpense > 0 ? ((item.total / stats.totalExpense) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.category} style={{ marginBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{item.category}</span>
                        <span style={{ color: '#EF4444', fontWeight: 700 }}>
                          ₹{item.total.toLocaleString('en-IN')} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#EF4444', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Income Breakdown */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', color: '#10B981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HiOutlineTrendingUp /> Income Sources Breakdown
              </h4>
              {stats.categoryBreakdown.income.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No income recorded yet.</p>
              ) : (
                stats.categoryBreakdown.income.map((item) => {
                  const pct = stats.totalIncome > 0 ? ((item.total / stats.totalIncome) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.category} style={{ marginBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{item.category}</span>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>
                          ₹{item.total.toLocaleString('en-IN')} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#10B981', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Filters Toolbar ── */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Type Toggle Tabs */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setTypeFilter('all')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: typeFilter === 'all' ? 'white' : 'transparent',
                color: typeFilter === 'all' ? '#0F172A' : '#64748B',
                boxShadow: typeFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: typeFilter === 'income' ? '#10B981' : 'transparent',
                color: typeFilter === 'income' ? 'white' : '#64748B',
                boxShadow: typeFilter === 'income' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              + Inflow
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: typeFilter === 'expense' ? '#EF4444' : 'transparent',
                color: typeFilter === 'expense' ? 'white' : '#64748B',
                boxShadow: typeFilter === 'expense' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              - Outflow
            </button>
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8FAFC',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              flex: '1',
              minWidth: '220px',
              maxWidth: '350px',
            }}
          >
            <HiOutlineSearch style={{ color: '#94A3B8', marginRight: '0.5rem', fontSize: '1.1rem' }} />
            <input
              type="text"
              placeholder="Search title, party, invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                <HiOutlineX />
              </button>
            )}
          </div>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'white',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="All">All Payment Modes</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Date Filter Presets */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'white',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="all">All Dates</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.82rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.82rem' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Main Transactions Ledger Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="page-loader">
            <div className="loading-spinner"></div>
          </div>
        ) : displayedTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <HiOutlineCurrencyRupee style={{ fontSize: '3.5rem', color: '#94A3B8', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Transactions Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              {searchTerm || typeFilter !== 'all' || categoryFilter !== 'All'
                ? 'No records match the current filters. Try resetting the filters.'
                : 'Start tracking your financial inflow and outflow by adding your first transaction.'}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button onClick={() => handleOpenAdd('income')} className="btn btn-success" style={{ backgroundColor: '#10B981', color: 'white', border: 'none' }}>
                + Record Income
              </button>
              <button onClick={() => handleOpenAdd('expense')} className="btn btn-danger" style={{ backgroundColor: '#EF4444', color: 'white', border: 'none' }}>
                + Record Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Date</th>
                  <th style={{ width: '90px' }}>Type</th>
                  <th>Title & Reference</th>
                  <th>Category</th>
                  <th>From / To (Party)</th>
                  <th>Mode</th>
                  <th>Bill / Receipt</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const receiptUrl = getFullUrl(tx.receipt);

                  return (
                    <tr key={tx._id}>
                      {/* Date */}
                      <td style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Type Badge */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isIncome ? '#059669' : '#DC2626',
                          }}
                        >
                          {isIncome ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                          {isIncome ? 'INCOME' : 'EXPENSE'}
                        </span>
                      </td>

                      {/* Title & Reference */}
                      <td>
                        <div style={{ maxWidth: '280px' }}>
                          <p style={{ fontWeight: 600, margin: '0 0 2px', color: '#0F172A', fontSize: '0.92rem' }}>
                            {tx.title}
                          </p>
                          {tx.reference && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                              Ref: {tx.reference}
                            </span>
                          )}
                          {tx.notes && (
                            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#334155',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Party */}
                      <td style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                        {tx.party || '—'}
                      </td>

                      {/* Payment Method */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            background: '#FAFAFA',
                          }}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Receipt */}
                      <td>
                        {tx.receipt ? (
                          <button
                            onClick={() => setReceiptModalUrl(receiptUrl)}
                            className="icon-btn"
                            title="View Attached Receipt / Bill"
                            style={{ color: 'var(--primary)' }}
                          >
                            <HiOutlinePhotograph style={{ fontSize: '1.2rem' }} />
                          </button>
                        ) : (
                          <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: isIncome ? '#059669' : '#DC2626',
                          }}
                        >
                          {isIncome ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            className="icon-btn edit"
                            onClick={() => handleOpenEdit(tx)}
                            title="Edit Transaction"
                          >
                            <HiOutlinePencil />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(tx._id, tx.title)}
                            title="Delete Transaction"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────── ADD / EDIT MODAL ─────────────────── */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: formData.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: formData.type === 'income' ? '#10B981' : '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  {formData.type === 'income' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                </div>
                <h3>{isEditing ? 'Edit Transaction' : formData.type === 'income' ? 'Record Income' : 'Record Expense'}</h3>
              </div>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <HiOutlineX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Type Switcher */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Transaction Type *</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: 'income',
                        category: INCOME_CATEGORIES[0],
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: formData.type === 'income' ? '2px solid #10B981' : '1px solid #E2E8F0',
                      background: formData.type === 'income' ? 'rgba(16, 185, 129, 0.08)' : 'white',
                      color: formData.type === 'income' ? '#059669' : '#64748B',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <HiOutlineTrendingUp /> + Income
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: 'expense',
                        category: EXPENSE_CATEGORIES[0],
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: formData.type === 'expense' ? '2px solid #EF4444' : '1px solid #E2E8F0',
                      background: formData.type === 'expense' ? 'rgba(239, 68, 68, 0.08)' : 'white',
                      color: formData.type === 'expense' ? '#DC2626' : '#64748B',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <HiOutlineTrendingDown /> - Expense
                  </button>
                </div>
              </div>

              {/* Title & Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Title / Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={formData.type === 'income' ? 'e.g. Donation from Ramesh Kumar' : 'e.g. 100 notebooks for primary section'}
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 5000"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Party & Payment Method */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>{formData.type === 'income' ? 'Received From (Donor / Funder)' : 'Paid To (Vendor / Recipient)'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={formData.type === 'income' ? 'e.g. Dr. Priya Singh' : 'e.g. Aggarwal Stationery Store'}
                    value={formData.party}
                    onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Mode</label>
                  <select
                    className="form-control"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference ID & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Bill No / UTR / Transaction ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UPI-928374829 / Bill #402"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Notes & Details</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Additional details about the expense or funding purpose..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Receipt / Invoice Upload */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <HiOutlineDocumentText /> Attach Receipt / Invoice / Bill (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptChange}
                  className="form-control"
                  style={{ padding: '0.4rem' }}
                />
                {receiptPreview && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Receipt image selected</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{
                    backgroundColor: formData.type === 'income' ? '#10B981' : '#EF4444',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {submitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Save Changes'
                    : formData.type === 'income'
                    ? '+ Record Income'
                    : '+ Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── RECEIPT PREVIEW MODAL ─────────────────── */}
      {receiptModalUrl && (
        <div className="modal-overlay" onClick={() => setReceiptModalUrl(null)}>
          <div
            className="modal"
            style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Attached Receipt / Bill</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={receiptModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <HiOutlineDownload /> Open File
                </a>
                <button className="icon-btn" onClick={() => setReceiptModalUrl(null)}>
                  <HiOutlineX />
                </button>
              </div>
            </div>
            <div style={{ padding: '1rem', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {receiptModalUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={receiptModalUrl} title="Receipt PDF" width="100%" height="500px" style={{ border: 'none' }} />
              ) : (
                <img
                  src={receiptModalUrl}
                  alt="Receipt"
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
