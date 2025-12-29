import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

export default function ProfileScreen() {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('expenseTracker_theme');
      const savedNotifications = await AsyncStorage.getItem('expenseTracker_notifications');
      
      if (savedTheme) {
        setTheme(savedTheme);
      }
      if (savedNotifications) {
        setNotifications(savedNotifications === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleThemeToggle = async (value) => {
    const newTheme = value ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('expenseTracker_theme', newTheme);
  };

  const handleNotificationsToggle = async (value) => {
    setNotifications(value);
    await AsyncStorage.setItem('expenseTracker_notifications', value.toString());
  };

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    // Save currency preference
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john.doe@example.com</Text>
          </View>
        </View>
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingDescription}>USD ($)</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currency}
              onValueChange={handleCurrencyChange}
              style={styles.picker}
              dropdownIconColor="#49454F"
            >
              <Picker.Item label="USD" value="USD" />
              <Picker.Item label="EUR" value="EUR" />
              <Picker.Item label="GBP" value="GBP" />
            </Picker>
          </View>
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Switch between themes</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={handleThemeToggle}
            trackColor={{ false: '#79747E', true: '#6750A4' }}
            thumbColor={theme === 'dark' ? '#D0BCFF' : '#FFFFFF'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>Budget alerts and updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#79747E', true: '#6750A4' }}
            thumbColor={notifications ? '#D0BCFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* About Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingDescription}>1.0.0</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy & Terms</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#49454F" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Export Data</Text>
          <MaterialCommunityIcons name="export" size={20} color="#49454F" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Import Data</Text>
          <MaterialCommunityIcons name="import" size={20} color="#49454F" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#F3EDF7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1C1B1F',
  },
  userEmail: {
    fontSize: 14,
    color: '#49454F',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1B1F',
  },
  settingDescription: {
    fontSize: 12,
    color: '#49454F',
  },
  pickerContainer: {
    backgroundColor: '#F7F2FA',
    borderRadius: 8,
    overflow: 'hidden',
    width: 120,
  },
  picker: {
    height: 40,
    color: '#1C1B1F',
  },
});