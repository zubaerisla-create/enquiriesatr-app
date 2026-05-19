import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addNote, updateNote, getNote, Note } from './notesStore';

export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const existingNote = id ? getNote(id) : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [body, setBody] = useState(existingNote?.body || '');

  const canSave = title.trim().length > 0 && body.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    if (isEditing && existingNote) {
      await updateNote(existingNote.id, {
        title: title.trim(),
        body: body.trim()
      });
    } else {
      await addNote(body.trim(), title.trim(), "personal", "");
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b-2 border-red-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="x" size={24} color="#666" />
        </TouchableOpacity>
        <Text className="text-xs font-black tracking-widest text-[#0D1520]">
          {isEditing ? 'EDIT NOTE' : 'NEW NOTE'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={!canSave} className="p-2">
          <Feather name="check" size={24} color={canSave ? "#000" : "#ccc"} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Note title..."
            placeholderTextColor="#9ca3af"
            className="text-2xl font-bold text-slate-700 py-6 border-b border-gray-200"
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Start writing your note..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            className="text-base text-slate-500 py-6 h-64"
            style={{ minHeight: 300 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
