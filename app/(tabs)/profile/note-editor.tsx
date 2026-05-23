import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AnimatedPage } from '../../../components/ui';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { addNote, updateNote, getNote, Note } from './notesStore';

const markdownStyles = {
  body: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  strong: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: '#E05252',
    textDecorationLine: 'underline',
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    color: '#b91c1c',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fence: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic',
  },
};

export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const existingNote = id ? getNote(id) : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [body, setBody] = useState(existingNote?.body || '');
  const [isEditingActive, setIsEditingActive] = useState(false);

  const canSave = title.trim().length > 0 && body.trim().length > 0;

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!canSave) return;

    if (isEditing && existingNote) {
      await updateNote(existingNote.id, {
        title: title.trim(),
        body: body.trim()
      });
      setIsEditingActive(false);
    } else {
      await addNote(body.trim(), title.trim(), "personal", "");
      router.back();
    }
  };

  const handleCancel = () => {
    setTitle(existingNote?.title || '');
    setBody(existingNote?.body || '');
    setIsEditingActive(false);
  };

  const showEditorView = !isEditing || isEditingActive;

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <AnimatedPage>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b-2 border-red-200">
          <TouchableOpacity
            onPress={isEditingActive ? handleCancel : () => router.back()}
            className="p-2"
          >
            <Feather name="x" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-xs font-black tracking-widest text-[#0D1520]">
            {isEditing ? (isEditingActive ? 'EDIT NOTE' : 'VIEW NOTE') : 'NEW NOTE'}
          </Text>
          {isEditing && !isEditingActive ? (
            <TouchableOpacity onPress={() => setIsEditingActive(true)} className="p-2">
              <Feather name="edit-2" size={24} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSave} disabled={!canSave} className="p-2">
              <Feather name="check" size={24} color={canSave ? "#000" : "#ccc"} />
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-5"
            keyboardShouldPersistTaps="handled"
          >
            {showEditorView ? (
              <>
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
              </>
            ) : (
              <>
                <Text className="text-2xl font-bold text-slate-700 py-6 border-b border-gray-200">
                  {title}
                </Text>
                <View className="py-6">
                  <Markdown style={markdownStyles}>
                    {body}
                  </Markdown>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </AnimatedPage>
    </SafeAreaView>
  );
}
