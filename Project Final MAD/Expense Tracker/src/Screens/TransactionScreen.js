import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const categories = [
  { name: 'Food', icon: 'food', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Entertainment', icon: 'movie', color: '#FFD166' },
  { name: 'Utilities', icon: 'flash', color: '#06D6A0' },
  { name: 'Shopping', icon: 'shopping', color: '#118AB2' },
  { name: 'Healthcare', icon: 'heart-pulse', color: '#EF476F' },
  { name: 'Education', icon: 'school', color: '#7209B7' },
  { name: 'Others', icon: 'dots-horizontal', color: '#8A8A8A' },
];

const timeFilters = [
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 },
  { label: 'Year', days: 365 },
  { label: 'All', days: 0 },
];

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [groupedTransactions, setGroupedTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterAndGroupTransactions();
  }, [transactions, searchQuery, selectedFilter]);

  const loadTransactions = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('expenseTracker_transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filterAndGroupTransactions = () => {
    let filtered = [...transactions];

    // Apply time filter
    if (selectedFilter < 3) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeFilters[selectedFilter].days);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query)
      );
    }

    // Group by date
    const grouped = filtered.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});

    const sections = Object.keys(grouped).map(date => ({
      title: formatDateForSection(date),
      data: grouped[date],
    }));

    sections.sort((a, b) => new Date(b.data[0].date) - new Date(a.data[0].date));
    
    setFilteredTransactions(filtered);
    setGroupedTransactions(sections);
  };

  const formatDateForSection = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatCurrency = (amount) => {
    return Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleTransactionPress = (transaction) => {
    // Open edit modal
    // You'll need to implement this
  };

  const renderTransactionItem = ({ item }) => {
    const categoryData = categories.find(c => c.name === item.category) || 
                       { icon: 'dots-horizontal', color: '#8A8A8A' };
    
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={[styles.transactionIcon, { backgroundColor: categoryData.color }]}>
          <MaterialCommunityIcons name={categoryData.icon} size={16} color="white" />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.category}</Text>
          <Text style={styles.transactionMeta} numberOfLines={1}>
            {item.notes || 'No notes'}
          </Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {item.type === 'income' ? '+' : '-'}${formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#49454F" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        {timeFilters.map((filter, index) => (
          <TouchableOpacity
            key={filter.label}
            style={[styles.chip, selectedFilter === index && styles.activeChip]}
            onPress={() => setSelectedFilter(index)}
          >
            <Text style={[styles.chipText, selectedFilter === index && styles.activeChipText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      {groupedTransactions.length > 0 ? (
        <SectionList
          sections={groupedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="receipt" 
            size={48} 
            color="#49454F" 
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.emptyText}>No transactions found</Text>
          {searchQuery || selectedFilter !== 3 ? (
            <Text style={styles.emptySubtext}>Try changing your search or filter</Text>
          ) : (
            <>
              <Text style={styles.emptySubtext}>Add your first transaction</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => navigation.navigate('Add')}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Transaction</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F2FA',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#1C1B1F',
    fontSize: 16,
  },
  chipContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F2FA',
    borderRadius: 8,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#6750A4',
  },
  chipText: {
    color: '#49454F',
    fontSize: 14,
    fontWeight: '500',
  },
  activeChipText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1B1F',
    marginTop: 16,
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3EDF7',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1B1F',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 11,
    color: '#49454F',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#06D6A0',
  },
  expenseAmount: {
    color: '#EF476F',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#49454F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#49454F',
    opacity: 0.7,
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});