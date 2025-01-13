import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  initializeDatabase,
  addItem,
  deleteItem,
  updateItem,
} from "../../Database/Database";
import CustomHeader from "@/app/CustomViews/CustomHeader";
import * as FileSystem from "expo-file-system";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";

const EditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const richTextRef = useRef(null);

  // States
  const [item, setItem] = useState(route.params?.item || null);
  const [id, setId] = useState(route.params?.item?.id || null);
  const [text, setText] = useState(route.params?.item?.description || "");
  const [title, setTitle] = useState(route.params?.item?.title || "Task");
  const [selectedText, setSelectedText] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [isItemModalVisible, setItemModalVisible] = useState(false); // New modal state
  const [selectedItem, setSelectedItem] = useState(null); // Holds selected item data

  const [history, setHistory] = useState([]); // Stores history for undo/redo
  const [redoHistory, setRedoHistory] = useState([]); // Stores history for redo

  let autoSaveTimeout = null;

  useEffect(() => {
    initializeDatabase();
  }, []);

  const [isImproveModalVisible, setImproveModalVisible] = useState(false);

  const improveItems = [
    {
      id: "1",
      name: "Readability",
      description: "Readability Dummy text",
      icon: "star",
    },
    {
      id: "2",
      name: "Fluency",
      description: "Fluency Dummy text",
      icon: "star-border",
    },
    {
      id: "3",
      name: "shorten",
      description: "shorten Dummy text",
      icon: "star-half",
    },
    {
      id: "4",
      name: "Expand",
      description: "Expand Dummy text",
      icon: "star-rate",
    },
  ];

  const handleImprovePress = () => {
    setImproveModalVisible(true); // Open the second modal
  };

  const handleGetText = async () => {
    if (richTextRef.current) {
      try {
        const plainText = await richTextRef.current.getText(); // Get the plain text content
        if (id != null) {
          handleUpdate(plainText);
        } else {
          handleAddItem(plainText);
        }
        // console.log("Plain text:", plainText);
        // Alert.alert("Plain text", plainText); // Display plain text in alert
      } catch (error) {
        console.error("Error getting text:", error);
      }
    }
  };

  const handleItemPress = (item) => {
    setModalVisible(false); // Close the first modal
    setImproveModalVisible(false); // Close the improve modal
    setSelectedItem(item);
    setItemModalVisible(true);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(selectedItem.description); // Copy the description to clipboard
    Alert.alert("Copied", "Item description copied to clipboard.");
    setItemModalVisible(false); // Close modal after copy
  };

  const handleAddToEditor = async () => {
    try {
      // Retrieve the selected range
      const editor = richTextRef.current;
      const selectedRange = await editor.getSelection();

      if (!selectedRange || selectedRange.length === 0) {
        Alert.alert("Error", "No text selected to replace!");
        return;
      }

      // Replace the selected text
      const { index, length } = selectedRange;
      editor.deleteText(index, length); // Delete the selected text
      editor.insertText(index, selectedItem.description, ""); // Insert the new text at the same position

      setSelectedText(""); // Clear the input field
      setItemModalVisible(false);
    } catch (error) {
      console.error("Error replacing text:", error);
      // Alert.alert("Error", "An issue occurred while replacing text.");
    }
  };

  const handleCloseModal = () => {
    setItemModalVisible(false); // Close the item modal
  };

  useEffect(() => {
    if (route.params?.item) {
      setItem(route.params?.item);
      setId(route.params.item?.id);
      setText(route.params.item?.description);
    }
  }, [route.params]);

  const handleAddItem = async (description) => {
    const date = new Date();
    try {
      await addItem(date, "Task", description);
      Alert.alert("Success", "Item added successfully!");
      navigation.navigate("DraftScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to add item.");
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async () => {
    try {
      Alert.alert(
        "Delete Item",
        "Are you sure you want to delete this item?",
        [
          { text: "Cancel", style: "cancel" },
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

  const handleUpdate = async (description) => {
    try {
      await updateItem(id, title || "Task", description);
      Alert.alert("Success", "Item updated successfully!");
      navigation.navigate("DraftScreen");
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "There was an error updating the item.");
    }
  };

  const handleDownloadHTML = async () => {
    try {
      const filePath = `${FileSystem.documentDirectory}draft.html`;
      await FileSystem.writeAsStringAsync(filePath, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      Alert.alert("Success", `File saved to: ${filePath}`);
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert("Error", "There was an issue saving the file.");
    }
  };

  const handleSelectionChange = async () => {
    if (richTextRef.current) {
      try {
        const editor = richTextRef.current;
        const selection = await editor.getSelection();

        if (selection && selection.length > 0) {
          const selectedText = await editor.getText(
            selection.index,
            selection.length
          );
          setSelectedText(selectedText);
          setModalVisible(true);
        } else {
          console.log("No text selected.");
        }
      } catch (error) {
        console.error("Error fetching selected text:", error);
      }
    }
  };

  // useEffect(() => {
  //   if (id != null) {
  //     if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  //     autoSaveTimeout = setTimeout(async () => {
  //       try {
  //         await updateItem(id, title || new Date().toISOString(), text);
  //       } catch (error) {
  //         console.error("Error during auto-save:", error);
  //       }
  //     }, 2000);
  //   } else {
  //     if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  //     autoSaveTimeout = setTimeout(async () => {
  //       try {
  //         await addItem(id, title || new Date().toISOString(), text);
  //       } catch (error) {
  //         console.error("Error during auto-save:", error);
  //       }
  //     }, 10000);
  //   }
  //   return () => {
  //     if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  //   };
  // }, [text]);

  // Updates text and history for undo/redo
  const handleTextChange = (newText) => {
    setHistory((prevHistory) => [...prevHistory, text]); // Save current text in history
    setRedoHistory([]); // Clear redo history whenever new changes are made
    setText(newText); // Update the current text state
  };

  // Handle Undo
  // Handle Undo
  const handleUndo = () => {
    if (richTextRef.current) {
      const editor = richTextRef.current.getEditor(); // Get the Quill editor instance
      if (editor && editor.history) {
        editor.history.undo(); // Perform Undo
        console.log("Undo performed");
      } else {
        console.error("Editor or history module not found.");
        Alert.alert("Error", "Editor or history module not found.");
      }
    } else {
      console.error("Editor instance not found.");
      Alert.alert("Error", "Editor instance not found.");
    }
  };
  // Handle Redo
  const handleRedo = () => {
    if (richTextRef.current) {
      const editor = richTextRef.current?.getEditor(); // Ensure we access the editor
      if (editor && editor.history) {
        editor.history.redo(); // Perform Redo
        console.log("Redo performed");
      } else {
        console.error("Editor or history module not found.");
        Alert.alert("Error", "Editor or history module not found.");
      }
    } else {
      console.error("Editor instance not found.");
      Alert.alert("Error", "Editor instance not found.");
    }
  };

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
        onTextChange={(value) => handleTextChange(value)}
      />

      <View style={{ height: 50, padding: 10 }}>
        {/* Undo and Redo Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={handleUndo}>
            <MaterialIcons
              name="undo"
              size={30}
              style={{ margin: 5 }}
              color={history.length === 0 ? "#ccc" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRedo}>
            <MaterialIcons
              name="redo"
              size={30}
              style={{ margin: 5 }}
              color={redoHistory.length === 0 ? "#ccc" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <QuillEditor
        ref={richTextRef}
        style={styles.editor}
        placeholder="Start writing your draft..."
        onChangeText={(value) => setText(value)}
        initialHtml={text}
        onSelectionChange={handleSelectionChange}
      />

      <QuillToolbar
        editor={richTextRef}
        options="full"
        style={styles.toolbar}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={id != null ? "Update" : "Save"}
          onPress={handleGetText}
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
            {/* Close Icon */}
            <TouchableOpacity
              style={styles.improveCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: 200,
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  handleImprovePress();
                }}
              >
                <Text style={styles.modalButtonText}>Improve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => {}}>
                <Text style={styles.modalButtonText}>Suggestion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Improve Modal (Second Modal) */}
      <Modal
        transparent={true}
        visible={isImproveModalVisible}
        animationType="fade"
        onRequestClose={() => setImproveModalVisible(false)}
      >
        <View style={styles.improveModalOverlay}>
          <View style={styles.improveModalContent}>
            {/* FlatList for the improve options */}
            <FlatList
              data={improveItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.improveItem}
                  onPress={() => handleItemPress(item)} // Handle item click
                >
                  <MaterialIcons name={item.icon} size={24} color="white" />
                  <Text style={styles.improveItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal for Selected Item Details */}
      <Modal
        transparent={true}
        visible={isItemModalVisible}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.itemModalOverlay}>
          <View style={styles.itemModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Display the selected item's details */}
            <Text style={styles.itemModalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.itemModalDescription}>
              {selectedItem?.description}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: 250,
            }}
          >
            {/* Buttons for Copy and Add to Editor */}
            <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
              <MaterialIcons name="file-copy" size={24} color="white" />
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddToEditor}
            >
              <MaterialIcons name="edit" size={24} color="white" />
              <Text style={styles.actionButtonText}>Add to Editor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  buttonsContainer: {
    flexDirection: "row",
    height: 50,
  },
  editor: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  toolbar: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  buttonContainer: { marginTop: 20 },
  modalOverlay: {
    borderRadius: 8,
    marginTop: "30%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    width: 220,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "rgba(35, 194, 96, 0.56)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  modalButtonText: {
    color: "#000",
    fontSize: 16,
  },
  improveCloseButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 5,
  },
  improveModalOverlay: {
    marginTop: "48%",
    borderRadius: 8,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  improveModalContent: {
    width: 220,
  },
  improveModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  improveItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: "#ccc",
  },
  improveItemText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
  },
  itemModalOverlay: {
    borderRadius: 8,
    marginTop: "30%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  itemModalContent: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    borderRadius: 8,
    width: 300,
    alignItems: "center",
  },
  itemModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  itemModalDescription: {
    fontSize: 14,
    marginBottom: 20,
    color: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  actionButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default EditorScreen;
