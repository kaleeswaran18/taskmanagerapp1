import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // State for tasks
  const [user, setUser] = useState(null); // Store logged-in user information
  const [socketCon, setSocketCon] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io("http://localhost:7000");
    setSocketCon(socket);
socket.on("newcornjob",(data)=>{
  toast.success(`${data.assignedUser.username} this is late date for your task of : ${data.title}`, {
    position: "top-right",
    autoClose: 3000,
  });
  // console.log("checkvalueallllll",data)
  
})
    // Listen for new task events
    socket.on("newTask", (data) => {
      console.log("check",data)
      const newTask = {
        ...data,
        updateTime: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
      };

      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks, newTask];
        sessionStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Store in sessionStorage
        return updatedTasks;
      });

      // Display a toast notification for the new task
      toast.success(`${data.action} by: ${data.title}`, {
        position: "top-right",
        autoClose: 3000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch tasks from API when user logs in
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const url =
            user.role === "Admin"
              ? "http://localhost:7000/users"
              : `http://localhost:7000/users/task/${user._id}`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          const tasksWithAdditionalFields = response.data.data.map((task) => ({
            ...task,
            updateTime: new Date().toLocaleTimeString(),
            date: new Date().toISOString().split("T")[0],
          }));

          setTasks(tasksWithAdditionalFields);
          sessionStorage.setItem(
            "tasks",
            JSON.stringify(tasksWithAdditionalFields)
          );

          // Notify user of successful task fetch
          toast.success(`Tasks fetched successfully for ${user.username}`, {
            position: "top-right",
            autoClose: 3000,
          });
        } catch (error) {
          console.error("Error fetching tasks:", error);

          // Notify user of task fetch error
          toast.error(`Failed to fetch tasks: ${error.message}`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      };

      fetchData();
    }
  }, [user]);

  // Add a new task
  const addTask = (task) => {
    const newTask = {
      ...task,
      updateTime: new Date().toLocaleTimeString(),
      date: new Date().toISOString().split("T")[0],
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      sessionStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Store in sessionStorage
      return updatedTasks;
    });

    if (socketCon) {
      socketCon.emit("createTask", newTask);
    }

    // Notify user of task addition
    toast.success(`Task "${task.title}" added successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Update an existing task
  const updateTask = (updatedTask) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.taskId === updatedTask.taskId ? updatedTask : task
      );
      sessionStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Store in sessionStorage
      return updatedTasks;
    });

    // Notify user of task update
    toast.info(`Task "${updatedTask.title}" updated successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.taskId !== id);
      sessionStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Store in sessionStorage
      return updatedTasks;
    });

    // Notify user of task deletion
    toast.warn(`Task deleted successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        user,
        setUser,
        addTask,
        updateTask,
        deleteTask,
        socketCon,
      }}
    >
      {children}
      {/* Add ToastContainer to render notifications */}
      <ToastContainer />
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
