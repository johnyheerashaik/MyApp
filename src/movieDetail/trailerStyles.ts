import {StyleSheet} from 'react-native';
import {SPACING, FONT_SIZE, FONT_WEIGHT} from '../constants';

export default StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.BASE,
    paddingTop: SPACING.BASE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  title: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  youtubeButton: {
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
  },
  youtubeButtonText: {
    fontSize: FONT_SIZE.SM,
    color: '#FF0000',
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
});
