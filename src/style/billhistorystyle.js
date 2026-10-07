import { StyleSheet } from 'react-native';
import { colors } from './theme';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16, 
        backgroundColor: colors.bg 
    },
    
    header: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 12, 
        color: colors.title 
    },
    itemRow: { 
        flexDirection: 'row', 
        justify: 'space-between', 
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderColor: colors.border 
    },
    menuName: { 
        fontSize: 16, 
        fontWeight: '500', 
        color: colors.text 
    },
    note: { 
        fontSize: 13, 
        color: colors.dim 
    },
    status: { 
        fontSize: 12, 
        color: colors.red 
    },
    price: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: colors.green 
    },
    footer: { 
        flexDirection: 'row', 
        justify: 'space-between', 
        alignItems: 'center',
        paddingVertical: 12, 
        borderTopWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg, 
        marginTop: 10 
    },
    totalText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: colors.text 
    },
    totalAmount: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: colors.green 
    },
    backButton: {
        backgroundColor: '#ccc',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    }
});