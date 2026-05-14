import React, { useState, useEffect } from 'react';
import { Shield, User, Check, X, Search, CreditCard } from 'lucide-react';
import { API_URL } from '../config';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const [updating, setUpdating] = useState(null); // stores email of user being updated

  const updateUserPlan = async (email, newPlan) => {
    setUpdating(email);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/admin/update-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, plan: newPlan })
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update plan:", err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <Shield color="var(--primary)" size={24} />
          <h1>Admin Dashboard</h1>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: '0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          Back to Site
        </button>
        <div className="admin-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Current Plan</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.email}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{user.name || 'No Name'}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`plan-pill ${user.plan}`}>
                    {user.plan.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-btns">
                    <button 
                      disabled={updating === user.email}
                      onClick={() => updateUserPlan(user.email, 'pro')} 
                      className="action-btn pro"
                    >
                      {updating === user.email ? 'Setting...' : 'Set Pro'}
                    </button>
                    <button 
                      disabled={updating === user.email}
                      onClick={() => updateUserPlan(user.email, 'ultra')} 
                      className="action-btn ultra"
                    >
                      {updating === user.email ? 'Setting...' : 'Set Ultra'}
                    </button>
                    <button 
                      disabled={updating === user.email}
                      onClick={() => updateUserPlan(user.email, 'free')} 
                      className="action-btn free"
                    >
                      {updating === user.email ? 'Setting...' : 'Reset'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
