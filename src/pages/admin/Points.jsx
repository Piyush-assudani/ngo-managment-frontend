import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineFilter, HiOutlineUser } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import ExportButtons from '../../components/ExportButtons';

const Points = () => {
  const [points, setPoints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterVolunteer, setFilterVolunteer] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [formData, setFormData] = useState({
    volunteer: '', category: '', points: '', date: new Date().toISOString().split('T')[0], remarks: '', action: 'add'
  });
  const [expandedRows, setExpandedRows] = useState({});

  const groupPointsByVolunteer = (pointsList) => {
    const grouped = pointsList.reduce((acc, point) => {
      const volId = point.volunteer?._id;
      if (!volId) return acc;
      if (!acc[volId]) {
        acc[volId] = {
          volunteer: point.volunteer,
          totalPoints: 0,
          records: []
        };
      }
      acc[volId].totalPoints += point.points;
      acc[volId].records.push(point);
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const groupedPoints = groupPointsByVolunteer(points);

  const toggleRow = (volId) => {
    setExpandedRows(prev => ({ ...prev, [volId]: !prev[volId] }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pointsRes, volRes, catRes] = await Promise.all([
        API.get('/points'),
        API.get('/volunteers'),
        API.get('/points-categories')
      ]);
      setPoints(pointsRes.data);
      setVolunteers(volRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPoints = async () => {
    try {
      const params = new URLSearchParams();
      if (filterVolunteer) params.append('volunteer', filterVolunteer);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      const { data } = await API.get(`/points?${params.toString()}`);
      setPoints(data);
    } catch (error) {
      toast.error('Failed to filter points');
    }
  };

  useEffect(() => {
    if (!loading) fetchFilteredPoints();
  }, [filterVolunteer, filterCategory, filterStartDate, filterEndDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalPoints = formData.action === 'deduct' ? -Math.abs(Number(formData.points)) : Math.abs(Number(formData.points));
      await API.post('/points', { ...formData, points: finalPoints });
      toast.success(formData.action === 'deduct' ? 'Points deducted successfully' : 'Points assigned successfully');
      setShowForm(false);
      setFormData({ volunteer: '', category: '', points: '', date: new Date().toISOString().split('T')[0], remarks: '', action: 'add' });
      fetchFilteredPoints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign points');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this points entry?')) return;
    try {
      await API.delete(`/points/${id}`);
      toast.success('Points entry deleted');
      fetchFilteredPoints();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const exportColumns = [
    { header: 'Date', selector: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Volunteer Name', selector: (row) => row.volunteer?.name },
    { header: 'Volunteer ID', selector: (row) => row.volunteer?.volunteerId },
    { header: 'Program/Category', selector: (row) => row.category?.name || 'N/A' },
    { header: 'Points', key: 'points' },
    { header: 'Remarks', key: 'remarks' }
  ];

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Points Management</h2>
          <p>Assign and track volunteer points by field and date</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButtons data={points} columns={exportColumns} filename="Volunteer_Points" />
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus /> Assign Points
          </button>
        </div>
      </div>

      {/* Assign Points Form */}
      {showForm && (
        <div className="inline-form-card">
          <h3>{formData.action === 'deduct' ? 'Deduct Points' : 'Assign Points'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="action" value="add" checked={formData.action === 'add'} onChange={(e) => setFormData({ ...formData, action: 'add' })} />
                  Add Points
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ef4444' }}>
                  <input type="radio" name="action" value="deduct" checked={formData.action === 'deduct'} onChange={(e) => setFormData({ ...formData, action: 'deduct' })} />
                  Deduct Points
                </label>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Volunteer *</label>
                <select value={formData.volunteer}
                  onChange={(e) => setFormData({ ...formData, volunteer: e.target.value })} required>
                  <option value="">Select Volunteer</option>
                  {volunteers.map((v) => (
                    <option key={v._id} value={v._id}>{v.name} ({v.volunteerId})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Task Category *</label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Points *</label>
                <input type="number" min="0" placeholder="Enter points" value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <input type="text" placeholder="Any remarks..." value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={`btn ${formData.action === 'deduct' ? 'btn-danger' : 'btn-primary'}`} style={formData.action === 'deduct' ? { backgroundColor: '#ef4444', color: 'white', border: 'none' } : {}}>
                {formData.action === 'deduct' ? 'Deduct Points' : 'Assign Points'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <HiOutlineFilter />
          <select value={filterVolunteer} onChange={(e) => setFilterVolunteer(e.target.value)}>
            <option value="">All Volunteers</option>
            {volunteers.map((v) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
          className="filter-date" placeholder="From" />
        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
          className="filter-date" placeholder="To" />
      </div>

      {/* Points Table */}
      <div className="table-container">
        {points.length === 0 ? (
          <div className="empty-state">
            <h3>No Points Records</h3>
            <p>Start assigning points to volunteers</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Category</th>
                <th>Points</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedPoints.map((group) => (
                <React.Fragment key={group.volunteer._id}>
                  <tr onClick={() => toggleRow(group.volunteer._id)} style={{ cursor: 'pointer', backgroundColor: expandedRows[group.volunteer._id] ? '#f8fafc' : 'transparent', borderBottom: '2px solid #e2e8f0' }}>
                    <td>
                      <p className="cell-name">{group.volunteer.name}</p>
                      <p className="cell-sub">{group.volunteer.volunteerId}</p>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>(All Categories)</span>
                    </td>
                    <td>
                      <span className="points-badge" style={{ fontSize: '1rem', padding: '0.4rem 1rem', backgroundColor: group.totalPoints < 0 ? '#fee2e2' : undefined, color: group.totalPoints < 0 ? '#ef4444' : undefined }}>
                        {group.totalPoints}
                      </span>
                    </td>
                    <td>-</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        (Click to {expandedRows[group.volunteer._id] ? 'collapse' : 'view breakdown'})
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/volunteers/${group.volunteer._id}`} onClick={(e) => e.stopPropagation()} className="icon-btn" title="View Full Profile" style={{color: '#0ea5e9'}}>
                        <HiOutlineUser />
                      </Link>
                    </td>
                  </tr>
                  {expandedRows[group.volunteer._id] && group.records.map(p => (
                    <tr key={p._id} style={{ backgroundColor: '#f1f5f9' }}>
                      <td style={{ paddingLeft: '3rem', color: '#64748b' }}>↳ Breakdown</td>
                      <td><span className="badge">{p.category?.name || '-'}</span></td>
                      <td>
                        <span className="points-badge" style={{ backgroundColor: p.points < 0 ? '#fee2e2' : undefined, color: p.points < 0 ? '#ef4444' : undefined }}>
                          {p.points}
                        </span>
                      </td>
                      <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                      <td>{p.remarks || '-'}</td>
                      <td>
                        <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}>
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Points;
