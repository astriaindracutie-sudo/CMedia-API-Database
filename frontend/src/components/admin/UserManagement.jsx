import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminComponents.css';

const API_BASE_URL = 'http://localhost:3000'; // Backend routes are mounted at root level

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchUsersAndRoles = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const headers = { Authorization: `Bearer ${token}` };

      const [usersResponse, rolesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/auth/staff`, { headers }),
        axios.get(`${API_BASE_URL}/auth/staff/roles`, { headers }),
      ]);

      setUsers(
        usersResponse.data.map((user) => ({
          ...user,
          role:
            rolesResponse.data.find((role) => role.role_id === user.role_id)
              ?.role_name || 'unknown',
        })),
      );
      setRoles(rolesResponse.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const roleId =
        roles.find((role) => role.role_name === formData.role_id)?.role_id || 1; // Default to first role if not found

      if (editingUser) {
        // Update existing user
        await axios.put(
          `${API_BASE_URL}/auth/staff/${editingUser.staff_id}`,
          {
            full_name: formData.full_name,
            email: formData.email,
            role_id: roleId,
          },
          { headers },
        );
      } else {
        // Add new user (staff registration)
        await axios.post(
          `${API_BASE_URL}/auth/register`,
          {
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            role_id: roleId,
          },
          { headers },
        );
      }
      await fetchUsersAndRoles(); // Refresh data
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting user data:', error);
      setError(error.response?.data?.error || 'Failed to save user data.');
    } finally {
      setLoading(false);
      setShowAddForm(false);
      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role_id: '',
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '', // Password is not pre-filled for security reasons
      role_id: user.role, // Use role name for dropdown
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_BASE_URL}/auth/staff/${userId}`, { headers });
        await fetchUsersAndRoles(); // Refresh data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting user:', error);
        setError(error.response?.data?.error || 'Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>User Management</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setEditingUser(null);
            setFormData({
              full_name: '',
              email: '',
              password: '',
              role_id: roles.length > 0 ? roles[0].role_name : '',
            });
          }}
        >
          + Add New User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder={
                    editingUser ? 'Leave blank to keep current password' : ''
                  }
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  required
                >
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingUser(null);
                    setFormData({
                      full_name: '',
                      email: '',
                      password: '',
                      role_id: roles.length > 0 ? roles[0].role_name : '',
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.staff_id}>
                <td>{user.staff_id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`role-badge role-${user.role.toLowerCase()}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.staff_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{users.length}</p>
        </div>
        <div className="stat-card">
          <h4>Admins</h4>
          <p>{users.filter((u) => u.role.toLowerCase() === 'admin').length}</p>
        </div>
        <div className="stat-card">
          <h4>Staff</h4>
          <p>{users.filter((u) => u.role.toLowerCase() === 'staff').length}</p>
        </div>
        <div className="stat-card">
          <h4>Other Roles</h4>
          <p>
            {
              users.filter(
                (u) => !['admin', 'staff'].includes(u.role.toLowerCase()),
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
