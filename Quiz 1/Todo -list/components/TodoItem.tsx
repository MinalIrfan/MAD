import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Check, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { Todo } from '@/types/todo';
import { useState } from 'react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onToggle(todo.id)}
        style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
      >
        {todo.completed && <Check size={18} color="#fff" strokeWidth={3} />}
      </TouchableOpacity>

      {isEditing ? (
        <TextInput
          style={styles.input}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          autoFocus
        />
      ) : (
        <TouchableOpacity style={styles.textContainer} onPress={() => onToggle(todo.id)}>
          <Text style={[styles.text, todo.completed && styles.textCompleted]}>
            {todo.text}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.iconButton}
        >
          <Edit3 size={20} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(todo.id)} style={styles.iconButton}>
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});
