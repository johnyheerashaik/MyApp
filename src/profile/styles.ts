import {StyleSheet} from 'react-native';
import {SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ICON_SIZE} from '../constants';

export default StyleSheet.create({
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: SPACING.XXXL,
    paddingRight: SPACING.BASE,
  },
  menuCard: {
    width: 260,
    borderRadius: BORDER_RADIUS.XXL,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  menuUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  menuAvatar: {
    width: ICON_SIZE.LG,
    height: ICON_SIZE.LG,
    borderRadius: BORDER_RADIUS.XL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.BASE,
  },
  menuAvatarText: {
    fontWeight: FONT_WEIGHT.BOLD,
  },
  menuUserName: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  menuUserEmail: {
    fontSize: FONT_SIZE.XS,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: SPACING.XS,
  },
  menuItem: {
    paddingVertical: SPACING.SM,
  },
  menuItemText: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  menuItemRow: {
    paddingVertical: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
