import {StyleSheet} from 'react-native';
import {SPACING, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, BORDER_RADIUS} from '../constants';

export default StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.XL,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.MD,
  },
  welcomeText: {
    fontSize: FONT_SIZE.XXXXL,
    fontWeight: FONT_WEIGHT.EXTRA_BOLD,
  },
  avatar: {
    width: ICON_SIZE.XL,
    height: ICON_SIZE.XL,
    borderRadius: BORDER_RADIUS.XXXL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    // Use theme.colors.white in component
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.LG,
  }
});
