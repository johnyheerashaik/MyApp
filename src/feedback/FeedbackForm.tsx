import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import { APP_STRINGS } from '../constants/strings';
import styles from './styles';

interface FeedbackFormProps {
    visible: boolean;
    onClose: () => void;
    userName?: string | null;
    userEmail?: string | null;
}

export default function FeedbackForm({
    visible,
    onClose,
    userName,
    userEmail,
}: FeedbackFormProps) {
    const [name, setName] = useState(userName || '');
    const [email, setEmail] = useState(userEmail || '');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !description.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            Sentry.captureFeedback({
                message: description,
                name: name.trim(),
                email: email.trim(),
            });

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                resetForm();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            Sentry.captureException(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName(userName || '');
        setEmail(userEmail || '');
        setDescription('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (showSuccess) {
        return (
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.successContainer}>
                        <Text style={styles.successTitle}>{APP_STRINGS.FEEDBACK_SUCCESS_TITLE}</Text>
                        <Text style={styles.successMessage}>
                            {APP_STRINGS.FEEDBACK_SUCCESS_MESSAGE}
                        </Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{APP_STRINGS.FEEDBACK_TITLE}</Text>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>
                            {APP_STRINGS.FEEDBACK_NAME_LABEL} <Text style={styles.required}>{APP_STRINGS.FEEDBACK_REQUIRED}</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            placeholder={APP_STRINGS.FEEDBACK_NAME_PLACEHOLDER}
                            placeholderTextColor="#999"
                            value={name}
                            editable={false}
                            autoCapitalize="words"
                            autoCorrect={false}
                            autoComplete="name"
                        />

                        <Text style={styles.label}>
                            {APP_STRINGS.FEEDBACK_EMAIL_LABEL} <Text style={styles.required}>{APP_STRINGS.FEEDBACK_REQUIRED}</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            placeholder={APP_STRINGS.FEEDBACK_EMAIL_PLACEHOLDER}
                            placeholderTextColor="#999"
                            value={email}
                            editable={false}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>
                            {APP_STRINGS.FEEDBACK_DESCRIPTION_LABEL} <Text style={styles.required}>{APP_STRINGS.FEEDBACK_REQUIRED}</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={APP_STRINGS.FEEDBACK_DESCRIPTION_PLACEHOLDER}
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            autoCapitalize="sentences"
                            autoCorrect={false}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={
                                isSubmitting ||
                                !name.trim() ||
                                !email.trim() ||
                                !description.trim()
                            }
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? APP_STRINGS.FEEDBACK_SENDING : APP_STRINGS.FEEDBACK_SUBMIT_BUTTON}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>{APP_STRINGS.FEEDBACK_CANCEL_BUTTON}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
