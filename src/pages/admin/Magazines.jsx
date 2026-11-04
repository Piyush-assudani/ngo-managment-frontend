import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { BASE_URL } from '../../utils/config';
import {
  HiOutlineBookOpen,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineStar,
  HiStar,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import FlipBookModal from '../../components/FlipBookModal';

const CATEGORIES = ['All', 'Annual', 'Quarterly', 'Monthly', 'Special Edition', 'Newsletter', 'General'];

const Magazines = () => {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPreviewMag, setSelectedPreviewMag] = useState(null);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    edition: '',
    description: '',
    category: 'Annual',
    publishDate: new Date().toISOString().split('T')[0],
    featured: false,
    isActive: true,
    coverImage: null,
    pdf: null,
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    setLoading(true);
    try {
      const res = await API.get('/magazines');
      setMagazines(res.data.magazines || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load magazines');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = () => {
    setFormData({
      title: '',
      edition: '',
      description: '',
      category: 'Annual',
      publishDate: new Date().toISOString().split('T')[0],
      featured: false,
      isActive: true,
      coverImage: null,
      pdf: null,
    });
    setCoverPreview(null);
    setUploadModalOpen(true);
  };

  const handleOpenEdit = (mag) => {
    setEditingItem(mag);
    setFormData({
      title: mag.title || '',
      edition: mag.edition || '',
      description: mag.description || '',
      category: mag.category || 'Annual',
      publishDate: mag.publishDate ? mag.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
      featured: !!mag.featured,
      isActive: mag.isActive !== undefined ? mag.isActive : true,
      coverImage: null,
      pdf: null,
    });
    setCoverPreview(mag.coverImage ? (mag.coverImage.startsWith('http') ? mag.coverImage : `${BASE_URL}${mag.coverImage}`) : null);
    setEditModalOpen(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, pdf: file }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Please enter a magazine title');
    }
    if (!formData.coverImage) {
      return toast.error('Please select a cover image');
    }
    if (!formData.pdf) {
      return toast.error('Please select a PDF file');
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('edition', formData.edition);
      body.append('description', formData.description);
      body.append('category', formData.category);
      body.append('publishDate', formData.publishDate);
      body.append('featured', formData.featured);
      body.append('isActive', formData.isActive);
      body.append('coverImage', formData.coverImage);
      body.append('pdf', formData.pdf);

      const res = await API.post('/magazines', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Magazine uploaded successfully!');
      setMagazines([res.data.magazine, ...magazines]);
      setUploadModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload magazine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Please enter a magazine title');
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('edition', formData.edition);
      body.append('description', formData.description);
      body.append('category', formData.category);
      body.append('publishDate', formData.publishDate);
      body.append('featured', formData.featured);
      body.append('isActive', formData.isActive);

      if (formData.coverImage) {
        body.append('coverImage', formData.coverImage);
      }
      if (formData.pdf) {
        body.append('pdf', formData.pdf);
      }

      const res = await API.put(`/magazines/${editingItem._id}`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Magazine updated successfully!');
      setMagazines(magazines.map((m) => (m._id === editingItem._id ? res.data.magazine : m)));
      setEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update magazine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.put(`/magazines/${id}/toggle`);
      setMagazines(magazines.map((m) => (m._id === id ? res.data.magazine : m)));
      toast.success(res.data.message || 'Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await API.put(`/magazines/${id}/toggle-featured`);
      setMagazines(magazines.map((m) => (m._id === id ? res.data.magazine : m)));
      toast.success(res.data.message || 'Featured status updated');
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await API.delete(`/magazines/${id}`);
      setMagazines(magazines.filter((m) => m._id !== id));
      toast.success('Magazine deleted successfully');
    } catch (err) {
      toast.error('Failed to delete magazine');
    }
  };

  const getFullUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  // Filtered list
  const filteredMagazines = magazines.filter((mag) => {
    const matchesCategory = selectedCategory === 'All' || mag.category === selectedCategory;
    const matchesSearch =
      mag.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mag.edition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalDownloads = magazines.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  const activeCount = magazines.filter((m) => m.isActive).length;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Magazine & Publications Management</h2>
          <p>Upload, organize, and manage editions of EnVision Magazine for website visitors</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenUpload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HiOutlinePlus style={{ fontSize: '1.2rem' }} /> Upload New Magazine
        </button>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <HiOutlineBookOpen />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Editions</span>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-primary)' }}>{magazines.length}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <HiOutlineCheck />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active on Website</span>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-primary)' }}>{activeCount}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <HiOutlineDownload />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Downloads</span>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-primary)' }}>{totalDownloads}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <HiOutlineStar />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Featured Edition</span>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
              {magazines.find((m) => m.featured)?.edition || 'None selected'}
            </h4>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-light, #F8FAFC)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <HiOutlineSearch style={{ color: 'var(--text-secondary)', marginRight: '0.5rem', fontSize: '1.1rem' }} />
            <input
              type="text"
              placeholder="Search by title, edition, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <HiOutlineX />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="page-loader">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredMagazines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <HiOutlineBookOpen style={{ fontSize: '3.5rem', color: '#94A3B8', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Magazines Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
              {searchTerm || selectedCategory !== 'All'
                ? 'No magazines match your search filters. Try clearing the filters.'
                : 'Upload your first NGO magazine or publication to showcase stories, achievements, and newsletters!'}
            </p>
            <button className="btn btn-primary" onClick={handleOpenUpload}>
              <HiOutlinePlus style={{ marginRight: '6px' }} /> Upload New Magazine
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Cover</th>
                  <th>Magazine Details</th>
                  <th>Category</th>
                  <th>Publish Date</th>
                  <th>File Size</th>
                  <th>Downloads</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMagazines.map((mag) => {
                  const coverSrc = getFullUrl(mag.coverImage);
                  const pdfSrc = getFullUrl(mag.pdfUrl);

                  return (
                    <tr key={mag._id}>
                      {/* Cover Thumbnail */}
                      <td>
                        <div
                          style={{
                            width: '56px',
                            height: '76px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            border: '1px solid var(--border)',
                            background: '#f1f5f9',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedPreviewMag(mag);
                          }}
                          title="Click to preview 3D FlipBook"
                        >
                          <img
                            src={coverSrc}
                            alt={mag.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                        </div>
                      </td>

                      {/* Details */}
                      <td>
                        <div style={{ maxWidth: '320px' }}>
                          <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                            {mag.title}
                          </p>
                          {mag.edition && (
                            <span
                              style={{
                                display: 'inline-block',
                                background: 'rgba(79, 70, 229, 0.08)',
                                color: 'var(--primary)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                marginBottom: '4px',
                              }}
                            >
                              {mag.edition}
                            </span>
                          )}
                          {mag.description && (
                            <p
                              style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {mag.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ fontSize: '0.85rem', background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontWeight: 500 }}>
                          {mag.category || 'General'}
                        </span>
                      </td>

                      {/* Publish Date */}
                      <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {mag.publishDate ? new Date(mag.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* File Size */}
                      <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {mag.fileSize || 'PDF'}
                      </td>

                      {/* Downloads */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <HiOutlineDownload style={{ color: '#F59E0B' }} />
                          {mag.downloadCount || 0}
                        </div>
                      </td>

                      {/* Featured Star */}
                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => handleToggleFeatured(mag._id)}
                          title={mag.featured ? 'Unmark Featured' : 'Mark as Featured on Homepage'}
                          style={{
                            color: mag.featured ? '#F59E0B' : 'var(--text-muted, #94A3B8)',
                            fontSize: '1.25rem',
                          }}
                        >
                          {mag.featured ? <HiStar /> : <HiOutlineStar />}
                        </button>
                      </td>

                      {/* Active Status */}
                      <td>
                        <button
                          onClick={() => handleToggleStatus(mag._id)}
                          className={`status-badge ${mag.isActive ? 'success' : 'danger'}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                          title="Click to toggle status"
                        >
                          {mag.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewMag(mag)}
                            className="icon-btn"
                            title="Interactive 3D FlipBook Preview"
                            style={{ color: 'var(--primary)' }}
                          >
                            <HiOutlineEye />
                          </button>

                          <button
                            className="icon-btn edit"
                            onClick={() => handleOpenEdit(mag)}
                            title="Edit Magazine Details"
                          >
                            <HiOutlinePencil />
                          </button>

                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(mag._id, mag.title)}
                            title="Delete Magazine"
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

      {/* ─────────────────── UPLOAD MODAL ─────────────────── */}
      {uploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <HiOutlineBookOpen style={{ fontSize: '1.6rem', color: 'var(--primary)' }} />
                <h3>Upload New Magazine Edition</h3>
              </div>
              <button className="icon-btn" onClick={() => setUploadModalOpen(false)}>
                <HiOutlineX />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Magazine Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. EnVision Chronicle 2025"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Edition / Issue Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Volume 2, Issue 1 (Winter Special)"
                    value={formData.edition}
                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Annual">Annual Edition</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Special Edition">Special Edition</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="General">General Publication</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Publication Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Highlights</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Share a brief overview of the stories, poems, student highlights, and achievements in this issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* File Uploads: Cover Image and PDF */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HiOutlinePhotograph /> Cover Image * (JPG, PNG, WebP)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleCoverChange}
                    className="form-control"
                    style={{ padding: '0.5rem' }}
                  />
                  {coverPreview && (
                    <div style={{ marginTop: '0.5rem', width: '100px', height: '135px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HiOutlineDocumentText /> Magazine PDF Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    required
                    onChange={handlePdfChange}
                    className="form-control"
                    style={{ padding: '0.5rem' }}
                  />
                  {formData.pdf && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <HiOutlineCheck /> Selected: {formData.pdf.name} ({(formData.pdf.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>🌟 Mark as Featured (Hero spotlight on website)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Visible on public website</span>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {submitting ? (
                    <>
                      <div className="btn-loader" style={{ width: '16px', height: '16px' }}></div>
                      Uploading Magazine...
                    </>
                  ) : (
                    'Upload & Publish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── EDIT MODAL ─────────────────── */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <HiOutlinePencil style={{ fontSize: '1.4rem', color: 'var(--primary)' }} />
                <h3>Edit Magazine Edition</h3>
              </div>
              <button className="icon-btn" onClick={() => setEditModalOpen(false)}>
                <HiOutlineX />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Magazine Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Edition / Issue Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.edition}
                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Annual">Annual Edition</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Special Edition">Special Edition</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="General">General Publication</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Publication Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Highlights</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Optional Replacement files */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>Replace Cover Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="form-control"
                    style={{ padding: '0.5rem' }}
                  />
                  {coverPreview && (
                    <div style={{ marginTop: '0.5rem', width: '90px', height: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Replace PDF Document (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                    className="form-control"
                    style={{ padding: '0.5rem' }}
                  />
                  {formData.pdf ? (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#10B981' }}>
                      New PDF selected: {formData.pdf.name}
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Current file: {editingItem?.fileSize || 'PDF attached'}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>🌟 Featured Edition</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Visible on public website</span>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── 3D PAGE TURNING FLIPBOOK MODAL ─────────────────── */}
      {selectedPreviewMag && (
        <FlipBookModal
          pdfUrl={getFullUrl(selectedPreviewMag.pdfUrl)}
          title={selectedPreviewMag.title}
          onClose={() => setSelectedPreviewMag(null)}
          onDownload={() => {
            const url = getFullUrl(selectedPreviewMag.pdfUrl);
            window.open(url, '_blank');
          }}
        />
      )}
    </div>
  );
};

export default Magazines;

