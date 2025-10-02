import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FilterType } from '@/types/todo';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[styles.tab, activeFilter === filter.key && styles.tabActive]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text style={[styles.tabText, activeFilter === filter.key && styles.tabTextActive]}>
            {filter.label}
          </Text>
          <View style={[styles.badge, activeFilter === filter.key && styles.badgeActive]}>
            <Text style={[styles.badgeText, activeFilter === filter.key && styles.badgeTextActive]}>
              {counts[filter.key]}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  badgeTextActive: {
    color: '#fff',
  },
});
