import React, { useState, useContext, useEffect } from "react";
import { AppContext, useAppContext } from "../context/AppContext";
import { Link,useNavigate } from "react-router-dom";
import "./Tasklist.css"; // Add your CSS file for styling
import axios from "axios";
import { io } from "socket.io-client"; // Import socket.io-client

const TaskList = () => {
  const navigate = useNavigate();
  const { tasks, setTasks } = useContext(AppContext); // Get tasks and setTasks from context
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for task form popup visibility
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
    assignedUser: "",
  }); // Form data state
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null); // State for socket connection
  const [editId, setEditId] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false); // State for delete confirmation popup
  const [taskToDelete, setTaskToDelete] = useState(null); // Store task ID to delete
  const [statusChangePopup, setStatusChangePopup] = useState(false); // State for change status popup
  const [selectedStatus, setSelectedStatus] = useState(""); // Store selected status for update
  const [taskToChangeStatus, setTaskToChangeStatus] = useState(null); // Store task ID to change status
  const [activeLogPopup, setActiveLogPopup] = useState(false); // State for showing active log popup
  const [activeLogs, setActiveLogs] = useState([]);
  const checkAdmin = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = checkAdmin?.role === "Admin"; // Check if the user is an admin


  const { socketCon } = useAppContext();


  // Format the date to YYYY-MM-DD for input fields
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };
  const [filterStatus, setFilterStatus] = useState(""); // Filter for status
  const [filterDueDate, setFilterDueDate] = useState("")
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const isValidDate = (date) => {
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };
  useEffect(() => {
    const fetchUserses = async () => {
      try {
        const response = await axios.get("http://localhost:7000/users/alluser");
        console.log(response.data.tasks)
        setUsers(response.data.tasks); // Store users data in state
        // setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        setError("Failed to fetch users");
        // setLoading(false);
      }
    };

    fetchUserses(); // Call the function to fetch users data
  }, []);
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!newTask.title || !newTask.description || !newTask.dueDate || !newTask.assignedUser) {
      setError("All fields are required.");
      return;
    }

    if (!isValidDate(newTask.dueDate)) {
      setError("Due date must be today or a future date.");
      return;
    }

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: newTask.status,
      assignedUser: newTask.assignedUser,
    };

    try {
      if (editId) {
        // Update task
        taskData.id = editId;
        await axios.put("http://localhost:7000/users", taskData, {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });

        // After updating the task, re-fetch all tasks from the server to ensure the UI is updated
        const updatedTasksResponse = await axios.get("http://localhost:7000/users", {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });

        
        setTasks(updatedTasksResponse.data.data);
        sessionStorage.setItem("tasks", JSON.stringify(updatedTasksResponse.data.data));
      } else {
        // Create new task
        const response = await axios.post("http://localhost:7000/users", taskData, {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });

        
        setTasks((prevTasks) => [...prevTasks, response.data.data]);
        sessionStorage.setItem("tasks", JSON.stringify([...tasks, response.data.data]));
      }

      // Reset the form
      setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
      setIsPopupOpen(false);
      setEditId("");
      setError("")
    } catch (error) {
      console.error("Failed to create/update task:", error);
      setError("Failed to save task. Please try again.");
    }
  };
  const filterTasks = () => {
    let filteredTasks = tasks.filter((task) => {
      const isDueDateMatch =
        !filterDueDate || new Date(task.dueDate).toISOString().split("T")[0] === filterDueDate;
      const isStatusMatch = !filterStatus || task.status === filterStatus;
      return isDueDateMatch && isStatusMatch;
    });

    // Sort tasks by dueDate (ascending), then by status (ascending)
    filteredTasks.sort((a, b) => {
      const dueDateA = new Date(a.dueDate);
      const dueDateB = new Date(b.dueDate);

      if (dueDateA !== dueDateB) {
        return dueDateA - dueDateB; // Sort by dueDate
      }

      // If dueDates are equal, sort by status (you can adjust this sorting logic based on your requirements)
      return a.status.localeCompare(b.status);
    });

    return filteredTasks;
  };
  const fetchActiveLogs = async () => {
    try {
      // Determine the role to send to the backend
      const role = checkAdmin.role === "Admin" ? "Admin" : checkAdmin._id;

      // Sending role as query parameter to the API
      const response = await axios.get('http://localhost:7000/users/logs', {
        params: { role }, // Send role as a query parameter
        headers: {
          Authorization: `Bearer ${checkAdmin.token}`, // Send the token for authentication
        },
      });

      console.log(response.data.data, 'response.data.data');
      setActiveLogs(response.data.data); // Assuming the API returns logs in response.data.data
    } catch (error) {
      console.error("Error fetching active logs:", error);
      setError("Failed to fetch active logs. Please try again.");
    }
  };



  // Toggle the Active Log popup
  const toggleActiveLogPopup = async () => {
    setActiveLogPopup((prev) => !prev);
    if (!activeLogPopup) {
      await fetchActiveLogs(); // Fetch logs when the popup is opened
    }
  };
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Conditional URL based on the user's role
        const url =
          checkAdmin.role === "Admin"
            ? "http://localhost:7000/users"
            : `http://localhost:7000/users/task/${checkAdmin._id}`;
  
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });
  
        setTasks(response.data.data); // Set tasks in state
        sessionStorage.setItem("tasks", JSON.stringify(response.data.data)); 
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    
    // Only fetch tasks if checkAdmin is available and has the required role
    if (checkAdmin && checkAdmin.token) {
      fetchTasks();
    }
  }, [checkAdmin, setTasks]);
  

  const editTask = (task) => {
    setNewTask({
      ...task,
      dueDate: formatDate(task.dueDate), // Format dueDate for input field
      assignedUser: task.assignedUser?._id || "", // Store assignedUser's ID (not username)
    });
    setEditId(task._id);
    setIsPopupOpen(true);
  };

  const openDeleteConfirmation = (taskId) => {
    console.log(taskId, 'taskId')
    setTaskToDelete(taskId);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete the task
      await axios.delete(`http://localhost:7000/users/${taskToDelete}`, {
        headers: { Authorization: `Bearer ${checkAdmin.token}` },
      });

      
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskToDelete));
      sessionStorage.setItem("tasks", JSON.stringify(tasks.filter((task) => task._id !== taskToDelete)));
      setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
      // setIsPopupOpen(false);
      setEditId("");
      // Close the confirmation popup
      setDeleteConfirmationOpen(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const cancelDelete = () => {
    setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
    // setIsPopupOpen(false);
    setEditId("");
    setDeleteConfirmationOpen(false); // Close the confirmation popup without deleting
    setTaskToDelete(null); // Reset task to delete

  };

  const openStatusChangePopup = (task) => {

    setTaskToChangeStatus(task._id);
    setSelectedStatus(task.status);
    setStatusChangePopup(true);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      console.log(selectedStatus, 'allfind')
      // let senddata={
      // id:taskToChangeStatus,
      // status:selectedStatus,
      // changestatus:true
      // }
      await axios.put(`http://localhost:7000/users`, {
        id: taskToChangeStatus,
        status: selectedStatus,
        changestatus: true
      }, {
        headers: { Authorization: `Bearer ${checkAdmin.token}` },
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskToChangeStatus ? { ...task, status: selectedStatus } : task
        )
      );
      sessionStorage.setItem("tasks", JSON.stringify(tasks));

      // Close the popup
      setStatusChangePopup(false);
    } catch (error) {
      console.error("Error changing task status:", error);
    }
  };

  const cancelStatusChange = () => {
    setStatusChangePopup(false);
  };

 const logout=()=>{
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("tasks");
  setTasks([])
    // Optionally, clear any user data in context
    

    // Redirect the user to the login page
    navigate("/login");
 }
  useEffect(() => {
    const storedTasks = JSON.parse(sessionStorage.getItem("tasks"));
    if (storedTasks) {
      setTasks(storedTasks);
    }
  }, [setTasks]);

  // Optionally, if you are using socket.io for live updates:
  // useEffect(() => {
  //   const socketConnection = io("http://localhost:7000");
  //   setSocket(socketConnection);

  //   // Listen for new tasks or updates from other users
  //   socketConnection.on("taskAdded", (newTask) => {
  //     setTasks((prevTasks) => [...prevTasks, newTask]);
  //   });

  //   return () => {
  //     socketConnection.disconnect();
  //   };
  //   // taskList
  // }, []);
// console.log(users,"users")
  return (
    <div className="task-list">
      <h1>{}</h1>

      {isAdmin && (
        <button className="add-task-btn" onClick={() => setIsPopupOpen((prev) => !prev)}>
          {isPopupOpen ? "Close" : "Add New Task"}
        </button>
      )}
      <button className="view-log-btn" onClick={toggleActiveLogPopup}>
        {activeLogPopup ? "Close Active Log" : "View Active Log"}
      </button>
      <button className="view-log-btn" onClick={logout}>
        Logout
      </button>
      {isAdmin && (
      <div className="filters">
        <label>
          Filter by Status:
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>

        <label>
          Filter by Due Date:
          <input
            type="date"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
          />
        </label>
      </div>
)}
      {activeLogPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <span className="close-icon" onClick={toggleActiveLogPopup}>
              &times;
            </span>
            <h3>Active Logs</h3>
            <div className="logs-container">
              {activeLogs?.map((log, index) => (
                <div key={log._id} className="log-card">
                  <div className="log-header">
                  {
  log.action !== "status change" ? (
    <h4>
      Admin side changes of  {checkAdmin.username === log.userId?.username
        ? "Your task"
        : log.userId?.username} 
    </h4>
  ) : (
    <h4>
      {checkAdmin.username === log.userId?.username
        ? "Your"
        : log.userId?.username} side change
    </h4>
  )
}

                    <p>{log.action}</p> {/* Display action */}
                  </div>
                  <div className="log-body">
                    <p><strong>Task Name:</strong> {log.title || 'N/A'}</p> {/* Display task title */}
                    <p><strong>Update Time:</strong> {log.updateTime}</p> {/* Display update time */}
                    <p><strong>Date:</strong> {log.date}</p> {/* Display date */}
                  </div>
                </div>
              ))}
              {activeLogs.length === 0 && <p>No active logs available.</p>}
            </div>
          </div>
        </div>
      )}

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <span
              className="close-icon"
              onClick={() => {
                // Reset the form data to its initial state
                setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
                // Clear the edit ID
                setEditId("");
                // Close the popup
                setIsPopupOpen(false);
              }}
            >
              &times;
            </span>

            <h3>{editId ? "Update Task" : "Add New Task"}</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>
                  Title:
                  <input type="text" name="title" value={newTask.title} onChange={handleInputChange} />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Due Date:
                  <input
                    type="date"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Status:
                  <select name="status" value={newTask.status} onChange={handleInputChange}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </label>
              </div>
              <div className="form-group">
                <label>
                  Assigned User:
                  <select
                    name="assignedUser"
                    value={newTask.assignedUser}
                    onChange={handleInputChange}
                  >
                    <option value="">Select User</option>
            {users
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} {/* Display the username */}
                </option>
              ))}
                  </select>

                </label>
              </div>
              <div className="form-buttons">
                <button type="submit">{editId ? "Update Task" : "Create Task"}</button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });  // Reset form data
                    setEditId(""); // Clear edit ID
                    setIsPopupOpen(false); // Close the popup
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirmationOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <span className="close-icon" onClick={cancelDelete}>&times;</span>
            <h3>Are you sure you want to delete this task?</h3>
            <div className="form-buttons">
              <button onClick={confirmDelete}>Yes</button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Change Status Popup */}
      {statusChangePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <span className="close-icon" onClick={cancelStatusChange}>
              &times;
            </span>
            <h3>Change Task Status</h3>
            <form onSubmit={handleStatusChange}>
              <div className="form-group">
                <label>
                  Status:
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit">Change Status</button>
                <button type="button" onClick={cancelStatusChange}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
   {tasks && tasks?.length > 0 ? (
      <ul className="task-list-items">
        {filterTasks().map((task) => (
          <li key={task._id}>
            <div className="task-item">
              <div>
                <p>Title: {task.title}</p>
                
      {task.assignedUser?.username ? (
        <>
          Assigned User: {task.assignedUser.username}
        </>
      ) : ''}
                <p>Description: {task.description}</p>
                <p>Status: {task.status}</p>
                <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
              {isAdmin && (
                <div className="task-actions">
                  <button onClick={() => editTask(task)}>Edit</button>
                  <button onClick={() => openDeleteConfirmation(task._id)}>Delete</button>
                </div>
              )}
              {!isAdmin && (
                <div>
                  <button onClick={() => openStatusChangePopup(task)}>
                    Change Status
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
  ): (
    <p>No tasks available.</p>
  )}
    </div>
  );
};

export default TaskList;
