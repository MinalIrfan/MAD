import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';

const categories = [
  { label: 'Food', value: 'Food' },
  { label: 'Transport', value: 'Transport' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Others', value: 'Others' },
];

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddTransaction = async () => {
    if (!amount || !category || !date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: type === 'income' ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount)),
      type: type,
      category: category,
      date: date.toISOString().split('T')[0],
      notes: notes,
      receipts: receipts,
    };

    try {
      const savedTransactions = await AsyncStorage.getItem('expenseTracker_transactions');
      let transactions = [];
      if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
      }
      transactions.unshift(newTransaction);
      await AsyncStorage.setItem('expenseTracker_transactions', JSON.stringify(transactions));
      
      // Reset form
      setAmount('');
      setCategory('');
      setDate(new Date());
      setNotes('');
      setReceipts([]);
      
      Alert.alert('Success', 'Transaction added successfully!');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const handleReceiptUpload = () => {
    Alert.alert(
      'Upload Receipt',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => launchCamera({ mediaType: 'photo' }, handleImageResponse) },
        { text: 'Gallery', onPress: () => launchImageLibrary({ mediaType: 'photo' }, handleImageResponse) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleImageResponse = (response) => {
    if (!response.didCancel && !response.errorCode) {
      const newReceipt = {
        id: Date.now().toString(),
        uri: response.assets[0].uri,
        name: response.assets[0].fileName || 'receipt.jpg',
        type: response.assets[0].type,
      };
      setReceipts([...receipts, newReceipt]);
    }
  };

  const handleExtractInfo = () => {
    setLoading(true);
    // Simulate OCR extraction
    setTimeout(() => {
      setAmount((Math.random() * 100 + 10).toFixed(2));
      setCategory(categories[Math.floor(Math.random() * categories.length)].value);
      setDate(new Date());
      setNotes('Receipt from vendor');
      setLoading(false);
      Alert.alert('Success', 'Information extracted from receipt!');
    }, 2000);
  };

  const removeReceipt = (index) => {
    const newReceipts = [...receipts];
    newReceipts.splice(index, 1);
    setReceipts(newReceipts);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Receipt Upload Section */}
      <View style={styles.card}>
        <Text style={styles.formLabel}>Receipt (Optional)</Text>
        <TouchableOpacity style={styles.receiptUploadArea} onPress={handleReceiptUpload}>
          <MaterialCommunityIcons name="receipt" size={48} color="#6750A4" />
          <Text style={styles.receiptUploadText}>Upload Receipt</Text>
          <Text style={styles.receiptUploadSubtext}>Take a photo or upload an image</Text>
        </TouchableOpacity>

        {receipts.length > 0 && (
          <>
            <Image source={{ uri: receipts[receipts.length - 1].uri }} style={styles.receiptPreview} />
            <View style={styles.receiptPreviewInfo}>
              <Text style={styles.receiptFileName} numberOfLines={1}>
                {receipts[receipts.length - 1].name}
              </Text>
              <TouchableOpacity 
                style={styles.receiptExtractButton} 
                onPress={handleExtractInfo}
                disabled={loading}
              >
                <MaterialCommunityIcons name="magic" size={12} color="white" />
                <Text style={styles.receiptExtractButtonText}>Extract Info</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.receiptAttachmentsContainer}>
              <Text style={styles.receiptAttachmentsTitle}>Attached Receipts</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.receiptAttachmentsList}>
                  {receipts.map((receipt, index) => (
                    <View key={receipt.id} style={styles.receiptAttachmentItem}>
                      <Image source={{ uri: receipt.uri }} style={styles.receiptAttachmentImage} />
                      <TouchableOpacity 
                        style={styles.receiptAttachmentRemove}
                        onPress={() => removeReceipt(index)}
                      >
                        <MaterialCommunityIcons name="close" size={10} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}
      </View>

      {/* Amount */}
      <View style={styles.card}>
        <Text style={styles.formLabel}>Amount</Text>
        <TextInput
          style={styles.textField}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      {/* Type */}
      <View style={styles.card}>
        <Text style={styles.formLabel}>Type</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'expense' && styles.activeTypeButton]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeButtonText, type === 'expense' && styles.activeTypeButtonText]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'income' && styles.activeTypeButton]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeButtonText, type === 'income' && styles.activeTypeButtonText]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category */}
      <View style={styles.card}>
        <Text style={styles.formLabel}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Date */}
      <View style={styles.card}>
        <Text style={styles.formLabel}>Date</Text>
        <TouchableOpacity style={styles.textField} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.formLabel}>Notes</Text>
        <TextInput
          style={[styles.textField, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddTransaction}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.submitButtonText}>Add Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  formLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#49454F',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptUploadArea: {
    borderWidth: 2,
    borderColor: '#CAC4D0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F3EDF7',
  },
  receiptUploadText: {
    fontSize: 14,
    color: '#1C1B1F',
    marginTop: 12,
    marginBottom: 4,
  },
  receiptUploadSubtext: {
    fontSize: 12,
    color: '#49454F',
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#CAC4D0',
  },
  receiptPreviewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  receiptFileName: {
    fontSize: 12,
    color: '#49454F',
    flex: 1,
  },
  receiptExtractButton: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  receiptExtractButtonText: {
    color: 'white',
    fontSize: 12,
  },
  receiptAttachmentsContainer: {
    marginTop: 16,
  },
  receiptAttachmentsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  receiptAttachmentsList: {
    flexDirection: 'row',
    gap: 8,
  },
  receiptAttachmentItem: {
    width: 80,
    height: 80,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CAC4D0',
  },
  receiptAttachmentImage: {
    width: '100%',
    height: '100%',
  },
  receiptAttachmentRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textField: {
    backgroundColor: '#F7F2FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1C1B1F',
  },
  dateText: {
    fontSize: 16,
    color: '#1C1B1F',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E8DEF8',
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#6750A4',
  },
  typeButtonText: {
    color: '#1C1B1F',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: 'white',
  },
  pickerContainer: {
    backgroundColor: '#F7F2FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#1C1B1F',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#6750A4',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#79747E',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6750A4',
    fontSize: 14,
    fontWeight: '500',
  },
});