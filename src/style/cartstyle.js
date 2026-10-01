import { StyleSheet } from 'react-native'
import { colors } from './theme'
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        
    },
    menuName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    price: {
        fontSize: 14,
        color: colors.price,
        marginTop: 4,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 32,
        height: 32,
        backgroundColor: colors.card,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 12,
        color: colors.green,
    },
    deleteBtn: {
        padding: 6,
    },
    footer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    totalText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.green,
    },
    submitButton: {
        backgroundColor: colors.green,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
})