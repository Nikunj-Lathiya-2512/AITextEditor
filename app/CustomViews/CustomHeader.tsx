import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Define the types for the props
interface CustomHeaderProps {
  title: string;
  onAddPress: () => void;
  onDeletePress: () => void;
  onDownloadPress?: () => void; // Callback for download button
  isDeleteMode: boolean; // Determines if delete mode is enabled
  showDownload?: boolean; // Conditional render for download icon
  showTextInput?: boolean; // Conditional render for TextInput
  onTextChange?: (value: string) => void; // Callback for text input change
  inputValue: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  onAddPress,
  onDeletePress,
  onDownloadPress,
  isDeleteMode,
  showDownload = false,
  showTextInput = false, // Default to false
  onTextChange, // New callback prop
  inputValue,
}) => {
  // const [inputValue, setInputValue] = useState("");

  const handleTextChange = (value: string) => {
    inputValue = value; // Update local state
    if (onTextChange) {
      onTextChange(value); // Invoke the callback with the new value
    }
  };

  return (
    <View style={styles.headerContainer}>
      {showTextInput ? (
        <TextInput
          style={styles.textInput}
          placeholder="File Name"
          value={inputValue}
          onChangeText={handleTextChange} // Use the handler here
          autoFocus={false}
        />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={isDeleteMode ? onDeletePress : onAddPress} // Conditional onPress action
          style={styles.iconButton}
        >
          <Icon
            name={isDeleteMode ? "delete" : "add"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        {showDownload && (
          <TouchableOpacity onPress={onDownloadPress} style={styles.iconButton}>
            <Icon name="download" size={30} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    elevation: 5, // For shadow effect on Android
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 5,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: "#fff",
  },
});

export default CustomHeader;
