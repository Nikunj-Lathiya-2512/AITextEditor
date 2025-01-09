import * as SQLite from "expo-sqlite";
import moment from "moment";

// Open the database asynchronously
const db = SQLite.openDatabaseSync("items.db");

// Initialize the database and create a table if it doesn't exist
export const initializeDatabase = async () => {
  try {
    // Ensure the table is created first
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// Add a new item to the database
export const addItem = async (date, title = "Task", description) => {
  try {
    // Ensure that the table is created before inserting
    await initializeDatabase();

    const result = await db.runAsync(
      `INSERT INTO items (date, title, description) VALUES (?, ?, ?);`,
      [moment(date).format("DD-MMM"), title, description]
    );
  } catch (error) {
    console.error("Error adding item:", error);
  }
};

// Fetch all items from the database
export const getItems = async () => {
  try {
    // Ensure that the table is created before querying
    await initializeDatabase();

    const rows = await db.getAllAsync("SELECT * FROM items;");
    return rows;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

// Delete an item by ID
export const deleteItem = async (id) => {
  try {
    // Ensure that the table is created before deleting
    await initializeDatabase();

    const result = await db.runAsync(`DELETE FROM items WHERE id = ?;`, [id]);
    console.log("Item deleted:", result);
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};

// Update an item by ID
export const updateItem = async (id, title = "Task", description) => {
  console.log(id, description);
  try {
    // Ensure that the table is created before updating
    await initializeDatabase();

    const result = await db.runAsync(
      `UPDATE items SET title = ?, description = ? WHERE id = ?;`,
      [title, description, id]
    );
    console.log("Item updated:", result);
  } catch (error) {
    console.error("Error updating item:", error);
  }
};
