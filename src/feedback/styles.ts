import { StyleSheet } from 'react-native';
import { FONT_SIZE, FONT_WEIGHT } from '../constants/typography';

export default StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: FONT_SIZE.XXXXL,
        fontWeight: FONT_WEIGHT.BOLD,
        color: '#000',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: FONT_SIZE.BASE,
        fontWeight: FONT_WEIGHT.SEMI_BOLD,
        color: '#000',
        marginBottom: 8,
        marginTop: 12,
    },
    required: {
        color: '#d32f2f',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: FONT_SIZE.LG,
        color: '#000',
    },
    inputDisabled: {
        backgroundColor: '#e8e8e8',
        color: '#666',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    submitButton: {
        backgroundColor: '#6a1b9a',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    submitButtonDisabled: {
        backgroundColor: '#9e9e9e',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: FONT_SIZE.LG,
        fontWeight: FONT_WEIGHT.SEMI_BOLD,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6a1b9a',
        fontSize: FONT_SIZE.LG,
        fontWeight: FONT_WEIGHT.SEMI_BOLD,
    },
    successContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        width: '80%',
        maxWidth: 400,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: FONT_WEIGHT.BOLD,
        color: '#4caf50',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: FONT_SIZE.LG,
        color: '#666',
        textAlign: 'center',
    },
});
