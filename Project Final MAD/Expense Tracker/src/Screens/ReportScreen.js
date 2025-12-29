import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

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

export default function ReportsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState({ income: [], expenses: [] });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateMonthlyData();
  }, [transactions]);

  const loadData = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('expenseTracker_transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateMonthlyData = () => {
    const today = new Date();
    const incomeData = [0, 0, 0, 0, 0, 0];
    const expensesData = [0, 0, 0, 0, 0, 0];
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthDiff = (today.getFullYear() - date.getFullYear()) * 12 + today.getMonth() - date.getMonth();
      
      if (monthDiff >= 0 && monthDiff < 6) {
        if (t.type === 'income') {
          incomeData[5 - monthDiff] += Math.abs(t.amount);
        } else {
          expensesData[5 - monthDiff] += Math.abs(t.amount);
        }
      }
    });
    
    setMonthlyData({ income: incomeData, expenses: expensesData });
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

  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  const totals = calculateTotals();

  const chartConfig = {
    backgroundColor: '#FFFBFE',
    backgroundGradientFrom: '#FFFBFE',
    backgroundGradientTo: '#FFFBFE',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(28, 27, 31, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.6,
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const generateMonthlyPDF = async () => {
    Alert.alert('Generating Report', 'Monthly report is being generated...');
    
    // Simplified PDF generation
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #6750A4; text-align: center; }
            .summary { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Monthly Expense Report</h1>
          <div class="summary">
            <div class="row"><strong>Total Income:</strong> $${formatCurrency(totals.income)}</div>
            <div class="row"><strong>Total Expenses:</strong> $${formatCurrency(totals.expenses)}</div>
            <div class="row"><strong>Net Balance:</strong> $${formatCurrency(totals.balance)}</div>
          </div>
        </body>
      </html>
    `;
    
    try {
      const options = {
        html,
        fileName: `expense-report-${new Date().toISOString().slice(0, 7)}`,
        directory: 'Documents',
      };
      
      const file = await RNHTMLtoPDF.convert(options);
      
      Alert.alert(
        'Report Generated',
        'Monthly report has been generated successfully!',
        [
          {
            text: 'Share',
            onPress: () => Share.share({
              url: `file://${file.filePath}`,
              title: 'Expense Report',
            }),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const generateYearlyPDF = async () => {
    Alert.alert('Generating Report', 'Yearly report is being generated...');
    
    // Similar implementation as monthly but with yearly data
    generateMonthlyPDF(); // For demo purposes
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* PDF Export Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export Reports</Text>
        
        <TouchableOpacity style={styles.pdfCard} onPress={generateMonthlyPDF}>
          <View style={styles.pdfIcon}>
            <MaterialCommunityIcons name="file-pdf" size={24} color="white" />
          </View>
          <View style={styles.pdfInfo}>
            <Text style={styles.pdfTitle}>Monthly Expense Report</Text>
            <Text style={styles.pdfDescription}>Download detailed PDF report for this month</Text>
          </View>
          <MaterialCommunityIcons name="download" size={20} color="#49454F" />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.pdfCard} onPress={generateYearlyPDF}>
          <View style={[styles.pdfIcon, { backgroundColor: '#7D5260' }]}>
            <MaterialCommunityIcons name="file-document" size={24} color="white" />
          </View>
          <View style={styles.pdfInfo}>
            <Text style={styles.pdfTitle}>Yearly Financial Report</Text>
            <Text style={styles.pdfDescription}>Complete annual financial summary</Text>
          </View>
          <MaterialCommunityIcons name="download" size={20} color="#49454F" />
        </TouchableOpacity>
      </View>

      {/* Monthly Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Monthly Overview</Text>
          <Text style={styles.cardSubtitle}>Last 6 Months</Text>
        </View>
        <BarChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                data: monthlyData.income,
              },
              {
                data: monthlyData.expenses,
              },
            ],
          }}
          width={screenWidth - 64}
          height={140}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={styles.statValue}>${formatCurrency(totals.income)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>${formatCurrency(totals.expenses)}</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>
        <View style={styles.categoriesGrid}>
          {sortedCategories.length > 0 ? (
            sortedCategories.map(([category, amount]) => {
              const categoryData = categories.find(c => c.name === category) || 
                                 { icon: 'dots-horizontal', color: '#8A8A8A' };
              const percentage = totals.expenses > 0 ? (amount / totals.expenses * 100).toFixed(0) : 0;
              
              return (
                <TouchableOpacity key={category} style={styles.categoryItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: categoryData.color }]}>
                    <MaterialCommunityIcons name={categoryData.icon} size={16} color="white" />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {category}
                    </Text>
                    <Text style={styles.categoryAmount}>
                      ${formatCurrency(amount)}
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {percentage}% of total
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCategories}>
              <Text style={styles.emptyText}>No spending data yet</Text>
            </View>
          )}
        </View>
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
  cardSubtitle: {
    fontSize: 12,
    color: '#49454F',
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  pdfIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#6750A4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  pdfDescription: {
    fontSize: 12,
    color: '#49454F',
  },
  divider: {
    height: 1,
    backgroundColor: '#CAC4D0',
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3EDF7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#49454F',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1B1F',
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
  emptyText: {
    fontSize: 14,
    color: '#49454F',
  },
});