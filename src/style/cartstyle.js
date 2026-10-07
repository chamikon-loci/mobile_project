import { StyleSheet } from 'react-native'
import { colors } from './theme'
export const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row', 

    
    alignItems: 'center',
    justify: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  foodImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  menuName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  price: {
    fontSize: 14,
    color: colors.price,
    marginTop: 2,
  },
  remarkText: {
    fontSize: 12,
    color: colors.dim,
    marginTop: 2,
  },
  actionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: colors.red,
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    backgroundColor: colors.green,
    borderRadius: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    color: colors.bg,
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.card,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: colors.bg,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.green,
  },
  submitButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 18,
    fontWeight: 'bold',
  },
})