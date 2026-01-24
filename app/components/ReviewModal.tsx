import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  userReview?: { rating: number; comment: string } | null;
}

export default function ReviewModal({ visible, onClose, onSubmit, userReview }: ReviewModalProps) {
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [comment, setComment] = useState(userReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(rating, comment.trim());
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {userReview ? 'Edit Your Review' : 'Add a Review'}
            </Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <MaterialIcons
                    name={star <= rating ? "star" : "star-border"}
                    size={32}
                    color="#F59E0B"
                  />
                </Pressable>
              ))}
            </View>
            <Text style={styles.ratingText}>{rating}.0 out of 5</Text>
          </View>

          {/* Comment Input */}
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this recipe..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Pressable 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {userReview ? 'Update Review' : 'Submit Review'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F97316',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});