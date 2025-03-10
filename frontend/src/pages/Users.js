import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "" });
  const [error, setError] = useState(null); // State for error messages

  useEffect(() => {
    fetchUsers();
  }, []);

  // Centralized error handler
  const handleError = (err) => {
    console.log("err!!!!!", err);
    const errorMessage =
      err.response?.data?.message || "An error occurred. Please try again.";
    setError(errorMessage);
    console.error("API Error:", errorMessage);
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("users");
      setUsers(res.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      handleError(err);
    }
  };

  const handleAddUser = async () => {
    try {
      await axiosInstance.post("users", newUser);
      fetchUsers();
      setError(null); // Clear any previous errors
    } catch (err) {
      handleError(err);
    }
  };

  const handleUpdateUser = async (id, updatedUser) => {
    try {
      await axiosInstance.put(`users/${id}`, updatedUser);
      fetchUsers();
      setError(null); // Clear any previous errors
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axiosInstance.delete(`users/${id}`);
      fetchUsers();
      setError(null); // Clear any previous errors
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      <h1>Users</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}{" "}
      {/* Display error */}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button onClick={handleAddUser}>Add User</button>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} ({user.email})
            <button
              onClick={() =>
                handleUpdateUser(user.id, {
                  username: "Updated Name",
                  email: user.email,
                })
              }
            >
              Update
            </button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
