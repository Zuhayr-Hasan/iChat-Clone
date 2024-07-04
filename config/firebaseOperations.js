import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

const acceptFriendRequest = async (requestId) => {
  try {
    await updateDoc(doc(database, "friendRequests", requestId), {
      status: "accepted",
    });
    alert("Friend request accepted!");
  } catch (error) {
    console.error("Error accepting friend request:", error);
    alert("Error accepting friend request. Please try again later.");
  }
};

export const deleteTaskFromDb = async (taskId) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  } catch (e) {
    console.error("Error deleting task: ", e);
  }
};

// Function to add a new task
export const addTask = async (task) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), task);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// Function to fetch user data by document ID
export const fetchUserData = async (uid) => {
  try {
    // console.log("Fetching data for user ID:", uid);

    // Reference to the document in the /users collection
    const docRef = doc(db, "users", uid);

    // Fetch the document snapshot
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Document data
      const userData = docSnap.data();
      console.log("User document ID:", docSnap.id);
      console.log("User data:", userData);
      return userData;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null; // Return null if an error occurs
  }
};

// Function to fetch tasks assigned to a specific user
export const fetchTasks = async (userId) => {
  try {
    const q = query(collection(db, "tasks"), where("assignedTo", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (e) {
    console.error("Error fetching tasks: ", e);
  }
};

// Function to update task status
export const updateTaskStatus = async (taskId, status) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status });
  } catch (e) {
    console.error("Error updating task: ", e);
  }
};

// Function to fetch employees
export const fetchEmployees = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "employee"));
    const querySnapshot = await getDocs(q);
    const employees = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    return employees;
  } catch (e) {
    console.error("Error fetching employees: ", e);
  }
};

// Function to fetch all tasks
export const fetchAllTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (e) {
    console.error("Error fetching tasks: ", e);
  }
};
