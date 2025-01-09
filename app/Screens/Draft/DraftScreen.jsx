import CustomHeader from "@/app/CustomViews/CustomHeader";
import { getItems } from "@/app/Database/Database";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const DraftScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const fetchedItems = await getItems();
      setItems(fetchedItems); // Update state with the fetched items
    };

    fetchItems(); // Call the fetch function
  }, []); // Empty dependency array means this runs only once when the component mounts

  const stripHTMLTags = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
  };

  // Component to render each item
  const ListItem = ({ item }) => (
    <View style={styles.columnItem}>
      {console.log(item.date)}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigation.navigate("EditorScreen", {
            item,
          });
        }}
      >
        <Text style={styles.title}>{item.date}</Text>
        <Text style={styles.date}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {stripHTMLTags(item.description)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleAddItem = () => {
    navigation.navigate("EditorScreen");
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title=""
        onAddPress={() => {
          handleAddItem();
        }}
      />

      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={ListItem}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  columnItem: {
    flex: 0.5, // Ensures the item takes up equal space
    margin: 5, // Adds space between items
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
});

export default DraftScreen;