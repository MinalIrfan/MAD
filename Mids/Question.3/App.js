import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl
} from 'react-native';

// API Configuration - UPDATE THIS with your computer's IP for physical device testing
// For Emulator: 'http://localhost:3000' or 'http://10.0.2.2:3000' (Android)
// For Physical Device: 'http://YOUR_IP:3000' (e.g., 'http://192.168.1.100:3000')
// Find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
const API_BASE_URL = 'http://192.168.56.1:3000'; // CHANGE THIS to your computer's IP

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRandom, setShowRandom] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to make API calls with proper error handling
  const fetchData = async (endpoint, isRandom = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Fetch with timeout
      const response = await Promise.race([
        fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        timeoutPromise
      ]);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (isRandom) {
          setMenuItems(Array.isArray(data.data) ? data.data : [data.data]);
        } else {
          setMenuItems(Array.isArray(data.data) ? data.data : []);
        }
        setShowRandom(isRandom);
      } else {
        throw new Error(data.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message || 'Failed to connect to server');
      setMenuItems([]);
      
      // Show user-friendly error message
      const errorMessage = error.message?.includes('Network request failed') || 
                          error.message?.includes('fetch')
        ? 'Cannot connect to server. Make sure:\n• Backend is running on port 3000\n• Your IP address is correct\n• Phone and computer are on same Wi-Fi'
        : error.message || 'An error occurred. Please try again.';
      
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFullMenu = () => {
    fetchData('/menu', false);
  };

  const fetchRandomItem = () => {
    fetchData('/menu/random', true);
  };

  const onRefresh = () => {
    if (showRandom) {
      fetchRandomItem();
    } else {
      fetchFullMenu();
    }
  };

  const renderMenuItem = ({ item, index }) => {
    // Safety checks for item data
    if (!item) return null;
    
    const itemId = item._id || item.id || `item-${index}`;
    const itemName = item.name || 'Unknown Item';
    const itemCategory = item.category || 'Uncategorized';
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    const inStock = item.inStock !== undefined ? item.inStock : true;

    return (
      <View style={styles.menuItem}>
        <View style={styles.menuItemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>
            {itemName}
          </Text>
          <View style={[styles.stockBadge, inStock ? styles.inStock : styles.outOfStock]}>
            <Text style={styles.stockText}>
              {inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </Text>
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <Text style={styles.itemCategory}>{itemCategory}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price:</Text>
          <Text style={styles.itemPrice}>Rs. {itemPrice.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const keyExtractor = (item, index) => {
    return item?._id || item?.id || `menu-item-${index}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>☕ Coffee Shop Menu</Text>
        <Text style={styles.subtitle}>Order Your Favorite Items</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.fullMenuButton, loading && styles.buttonDisabled]}
          onPress={fetchFullMenu}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading && !showRandom ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>📋 Full Menu</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.surpriseButton, loading && styles.buttonDisabled]}
          onPress={fetchRandomItem}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading && showRandom ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>🎲 Surprise Me</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {loading && menuItems.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      ) : (
        <View style={styles.menuContainer}>
          {menuItems.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {showRandom ? '🎁 Surprise Item!' : `📋 Menu Items (${menuItems.length})`}
                </Text>
                {!showRandom && (
                  <TouchableOpacity 
                    onPress={onRefresh}
                    style={styles.refreshButton}
                    disabled={refreshing}
                  >
                    <Text style={styles.refreshText}>🔄 Refresh</Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#8B4513']}
                    tintColor="#8B4513"
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No items found</Text>
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>☕</Text>
              <Text style={styles.emptyText}>
                No items to display.{'\n'}
                Tap a button to load menu items.
              </Text>
              {error && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchFullMenu}
                >
                  <Text style={styles.retryText}>🔄 Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFE4B5',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullMenuButton: {
    backgroundColor: '#4CAF50',
  },
  surpriseButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  refreshButton: {
    padding: 5,
  },
  refreshText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 12,
    marginHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  stockBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  inStock: {
    backgroundColor: '#4CAF50',
  },
  outOfStock: {
    backgroundColor: '#F44336',
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#8B4513',
    borderRadius: 25,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
