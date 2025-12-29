import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
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

export default function DashboardScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('expenseTracker_transactions');
      const savedTheme = await AsyncStorage.getItem('expenseTracker_theme');
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateTotals = () => {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += Math.abs(t.amount);
      } else {
        expenses += Math.abs(t.amount);
      }
    });
    
    return { income, expenses, balance: income - expenses };
  };

  const totals = calculateTotals();
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Weekly data for chart
  const weeklyData = calculateWeeklySpending();

  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#1C1B1F' : '#FFFBFE',
    backgroundGradientFrom: theme === 'dark' ? '#1C1B1F' : '#FFFBFE',
    backgroundGradientTo: theme === 'dark' ? '#1C1B1F' : '#FFFBFE',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(239, 71, 111, ${opacity})`,
    labelColor: (opacity = 1) => theme === 'dark' ? `rgba(230, 225, 229, ${opacity})` : `rgba(28, 27, 31, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#EF476F',
    },
  };

  const calculateWeeklySpending = () => {
    const today = new Date();
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySpending = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      weeklyData[6 - i] = daySpending;
    }
    
    return weeklyData;
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView}>
        {/* Income vs Expense Section */}
        <View style={styles.incomeExpenseSection}>
          <TouchableOpacity style={[styles.incomeExpenseCard, styles.incomeCard]}>
            <View style={styles.incomeExpenseIcon}>
              <MaterialCommunityIcons name="arrow-down" size={20} color="#06D6A0" />
            </View>
            <Text style={styles.incomeExpenseLabel}>Income</Text>
            <Text style={styles.incomeExpenseValue}>${formatCurrency(totals.income)}</Text>
            <Text style={[styles.incomeExpenseChange, { color: '#06D6A0' }]}>
              {transactions.length > 0 ? '+12%' : '+0%'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.incomeExpenseCard, styles.expenseCard]}>
            <View style={styles.incomeExpenseIcon}>
              <MaterialCommunityIcons name="arrow-up" size={20} color="#EF476F" />
            </View>
            <Text style={styles.incomeExpenseLabel}>Expenses</Text>
            <Text style={styles.incomeExpenseValue}>${formatCurrency(totals.expenses)}</Text>
            <Text style={[styles.incomeExpenseChange, { color: '#EF476F' }]}>
              {transactions.length > 0 ? '+8%' : '+0%'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, theme === 'dark' && styles.darkText]}>Weekly Overview</Text>
            <Text style={[styles.cardSubtitle, theme === 'dark' && styles.darkSubtext]}>This Week</Text>
          </View>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{ data: weeklyData }],
            }}
            width={screenWidth - 64}
            height={140}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Balance Card */}
        <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
          <View style={styles.balanceContainer}>
            <View>
              <Text style={[styles.balanceLabel, theme === 'dark' && styles.darkSubtext]}>Current Balance</Text>
              <Text style={[styles.balanceValue, theme === 'dark' && styles.darkText]}>
                ${formatCurrency(totals.balance)}
              </Text>
            </View>
            <View style={styles.balanceChange}>
              <Text style={{ color: totals.balance >= 0 ? '#06D6A0' : '#EF476F' }}>
                {totals.balance >= 0 ? '+' : ''}{transactions.length > 0 ? '15%' : '0%'}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Categories */}
        <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, theme === 'dark' && styles.darkText]}>Top Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={[styles.viewAllButton, theme === 'dark' && styles.darkText]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {topCategories.length > 0 ? (
              topCategories.map(([category, amount]) => {
                const categoryData = categories.find(c => c.name === category) || 
                                   { icon: 'dots-horizontal', color: '#8A8A8A' };
                const percentage = totals.expenses > 0 ? (amount / totals.expenses * 100).toFixed(0) : 0;
                
                return (
                  <TouchableOpacity 
                    key={category} 
                    style={[styles.categoryItem, theme === 'dark' && styles.darkCategoryItem]}
                    onPress={() => navigation.navigate('Reports')}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: categoryData.color }]}>
                      <MaterialCommunityIcons name={categoryData.icon} size={16} color="white" />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryName, theme === 'dark' && styles.darkText]} numberOfLines={1}>
                        {category}
                      </Text>
                      <Text style={[styles.categoryAmount, theme === 'dark' && styles.darkText]}>
                        ${formatCurrency(amount)}
                      </Text>
                      <Text style={[styles.categoryPercentage, theme === 'dark' && styles.darkSubtext]}>
                        {percentage}% of total
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyCategories}>
                <Text style={[styles.emptyText, theme === 'dark' && styles.darkSubtext]}>No spending data yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, theme === 'dark' && styles.darkText]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.viewAllButton, theme === 'dark' && styles.darkText]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const categoryData = categories.find(c => c.name === transaction.category) || 
                                   { icon: 'dots-horizontal', color: '#8A8A8A' };
                
                return (
                  <TouchableOpacity 
                    key={transaction.id} 
                    style={[styles.transactionItem, theme === 'dark' && styles.darkTransactionItem]}
                    onPress={() => {/* Open edit modal */}}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: categoryData.color }]}>
                      <MaterialCommunityIcons name={categoryData.icon} size={16} color="white" />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={[styles.transactionTitle, theme === 'dark' && styles.darkText]}>
                        {transaction.category}
                      </Text>
                      <Text style={[styles.transactionMeta, theme === 'dark' && styles.darkSubtext]}>
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.notes || 'No notes'}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                      theme === 'dark' && styles.darkText
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyTransactions}>
                <MaterialCommunityIcons 
                  name="receipt" 
                  size={48} 
                  color={theme === 'dark' ? '#CAC4D0' : '#49454F'} 
                  style={{ opacity: 0.5 }}
                />
                <Text style={[styles.emptyText, theme === 'dark' && styles.darkSubtext]}>No transactions yet</Text>
                <Text style={[styles.emptySubtext, theme === 'dark' && styles.darkSubtext]}>Add your first transaction</Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => navigation.navigate('Add')}
                >
                  <Text style={styles.addFirstButtonText}>Add Your First Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  darkContainer: {
    backgroundColor: '#1C1B1F',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  incomeExpenseSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  incomeExpenseCard: {
    flex: 1,
    backgroundColor: '#F3EDF7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#06D6A0',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF476F',
  },
  incomeExpenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 214, 160, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  incomeExpenseLabel: {
    fontSize: 14,
    color: '#49454F',
    marginBottom: 4,
  },
  incomeExpenseValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  incomeExpenseChange: {
    fontSize: 12,
    marginTop: 4,
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
  darkCard: {
    backgroundColor: '#24222D',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1B1F',
  },
  darkText: {
    color: '#E6E1E5',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#49454F',
  },
  darkSubtext: {
    color: '#CAC4D0',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#49454F',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  balanceChange: {
    backgroundColor: 'rgba(6, 214, 160, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewAllButton: {
    color: '#6750A4',
    fontSize: 11,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8DEF8',
    borderRadius: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F7F2FA',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  darkCategoryItem: {
    backgroundColor: '#2D2B37',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1B1F',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  categoryPercentage: {
    fontSize: 11,
    color: '#49454F',
    marginTop: 2,
  },
  emptyCategories: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3EDF7',
    borderRadius: 8,
    gap: 12,
  },
  darkTransactionItem: {
    backgroundColor: '#24222D',
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
  emptyTransactions: {
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
  },
  addFirstButton: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});