import {StyleSheet} from 'react-native';
import {SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, DARK_THEME_COLORS} from '../constants';

export default StyleSheet.create({
  
  aiFab: {
    position: 'absolute',
    bottom: 110,
    right: SPACING.XL,
    width: ICON_SIZE.XXXL,
    height: ICON_SIZE.XXXL,
    borderRadius: BORDER_RADIUS.FULL,
    justifyContent: 'center',
    alignItems: 'center',
    // Use theme.colors.primary in component
    backgroundColor: DARK_THEME_COLORS.primary,
    elevation: 6,
  },
  aiFabText: {
    fontSize: FONT_SIZE.XXXXXL,
  },

  aiPopupOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  aiBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: DARK_THEME_COLORS.overlay,
  },
  aiPopupCard: {
    width: '88%',           
    maxHeight: 500,
    marginRight: SPACING.XL,       
    marginBottom: 120,
    position: 'relative',
  },
  aiCloseButton: {
    position: 'absolute',
    top: SPACING.SM,
    right: SPACING.SM,
    width: ICON_SIZE.LG,
    height: ICON_SIZE.LG,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    // Use theme.colors.overlay or similar in component
    backgroundColor: DARK_THEME_COLORS.overlay,
    zIndex: 10,
  },
  aiCloseText: {
    color: DARK_THEME_COLORS.text,
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
});
