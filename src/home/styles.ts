import {StyleSheet} from 'react-native';
import {SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ICON_SIZE} from '../constants';

export default StyleSheet.create({
  screen: {
    flex: 1,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: SPACING.XL,
    right: SPACING.XL,
    bottom: SPACING.XXXL,
  },
  primaryButton: {
    height: ICON_SIZE.XXL,
    borderRadius: BORDER_RADIUS.XXXL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  }
});
