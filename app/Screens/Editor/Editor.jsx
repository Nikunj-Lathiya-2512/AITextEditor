import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import {
  initializeDatabase,
  addItem,
  deleteItem,
  updateItem,
} from "../../Database/Database";
import CustomHeader from "@/app/CustomViews/CustomHeader";
import * as FileSystem from "expo-file-system";

const EditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const richTextRef = useRef(null);

  // States
  const [item, setItem] = useState(route.params?.item || null);
  const [id, setId] = useState(route.params?.item?.id || null);
  const [text, setText] = useState(route.params?.item?.description || "");
  const [title, setTitle] = useState(route.params?.item?.title || "Task");
  const [selectedText, setSelectedText] = useState(""); // State to store selected text

  const [isModalVisible, setModalVisible] = useState(false); // State to control popup visibility

  let autoSaveTimeout = null;

  // Initialize the database when the app loads
  useEffect(() => {
    initializeDatabase();
    console.log(text);
  }, []);

  // Update the `text` when the `route.params` changes

  useEffect(() => {
    if (route.params?.item) {
      setItem(route.params.item);
      setId(route.params.item.id);
      setText(route.params.item.description);
    }
  }, [route.params]);

  // Handle saving a new draft
  const handleAddItem = async () => {
    const date = new Date().toISOString(); // Get the current date
    try {
      await addItem(date, "Task", text); // Use default "Task" if title is empty
      Alert.alert("Success", "Item added successfully!");
      navigation.navigate("DraftScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to add item.");
      console.error("Error adding item:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      Alert.alert(
        "Delete Item",
        "Are you sure you want to delete this item?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              await deleteItem(id);
              Alert.alert("Success", "Item deleted successfully!");
              navigation.navigate("DraftScreen");
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error handling delete:", error);
    }
  };

  // Handle form submission
  const handleUpdate = async () => {
    try {
      await updateItem(id, item.title || "Task", text);
      Alert.alert("Success", "Item updated successfully!");
      navigation.navigate("DraftScreen");
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "There was an error updating the item.");
    }
  };

  // Function to handle text selection
  const handleSelectionChange = (selectedText) => {
    if (selectedText && selectedText.trim() !== "") {
      setSelectedText(selectedText); // Store the selected text
      setModalVisible(true); // Show the popup
    }
  };

  const handleTextChange = (value) => {
    setTitle(value);
    console.log("Input Value:", value);
  };

  // Function to download HTML content
  const handleDownloadHTML = async () => {
    try {
      // Define file path
      const filePath = `${FileSystem.documentDirectory}draft.html`;

      // Write the HTML content to a file
      await FileSystem.writeAsStringAsync(filePath, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert("Success", `File saved to: ${filePath}`);
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert("Error", "There was an issue saving the file.");
    }
  };

  useEffect(() => {
    if (id != null) {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

      autoSaveTimeout = setTimeout(async () => {
        try {
          await updateItem(id, title || new Date().toISOString(), text);
          console.log("Auto-saved description:", text);
        } catch (error) {
          console.error("Error during auto-save:", error);
        }
      }, 2000); // Debounce: Auto-save after 2 seconds of inactivity
    } else {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

      autoSaveTimeout = setTimeout(async () => {
        try {
          await addItem(id, title || new Date().toISOString(), text);
          console.log("Auto-saved description:", text);
        } catch (error) {
          console.error("Error during auto-save:", error);
        }
      }, 2000);
    }

    return () => {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    };
  }, [title]); // Only run when `text` changes

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Edit"
        isDeleteMode={id != null}
        onDeletePress={handleDelete}
        showDownload={true}
        onDownloadPress={handleDownloadHTML}
        showTextInput={true}
        inputValue={title}
        onTextChange={handleTextChange} // Pass the callback here
      />

      {/* Rich Text Editor */}
      <RichEditor
        ref={richTextRef}
        initialContentHTML={text}
        style={styles.editor}
        placeholder="Start writing your draft..."
        onChange={(description) => setText(description)}
        onSelectionChange={() => alert("call")} // This will trigger when text is selected
        editorStyle={{ backgroundColor: "#fff" }}
      />

      {/* Rich Toolbar */}
      <RichToolbar
        editor={richTextRef}
        actions={[
          "bold",
          "italic",
          "underline",
          "undo",
          "redo",
          "unorderedList",
          "orderedList",
          "checkboxList",
          "justifyLeft",
          "justifyCenter",
          "justifyRight",
        ]}
        style={styles.toolbar}
        iconTint="#000"
      />

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={id != null ? "Update" : "Save"}
          onPress={id != null ? handleUpdate : handleAddItem}
          color="#007bff"
        />
      </View>

      {/* Modal for Improve and Suggestion Options */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an Action</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Alert.alert("Improve", `Improving: "${selectedText}"`);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Improve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Alert.alert("Suggestion", `Suggesting for: "${selectedText}"`);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Suggestion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  editor: {
    flex: 1,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  toolbar: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  buttonContainer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginVertical: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default EditorScreen;
