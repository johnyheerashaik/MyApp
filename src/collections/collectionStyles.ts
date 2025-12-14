import {StyleSheet} from 'react-native';
import {SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE} from '../constants';

export default StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.MD,
  },
  backButton: {
    width: ICON_SIZE.LG,
    height: ICON_SIZE.LG,
    borderRadius: BORDER_RADIUS.FULL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: FONT_SIZE.XXXL,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  headerTitle: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.EXTRA_BOLD,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.SM,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.BASE,
    textAlign: 'center',
    paddingHorizontal: SPACING.LG,
  },
  list: {
    padding: SPACING.LG,
  },
  row: {
    justifyContent: 'space-between',
  },
  movieCard: {
    width: '48%',
    marginBottom: SPACING.BASE,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  movieInfo: {
    padding: SPACING.SM,
  },
  movieTitle: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
    marginBottom: SPACING.XS / 2,
  },
  movieMeta: {
    fontSize: FONT_SIZE.XS,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.SM,
    right: SPACING.SM,
    width: ICON_SIZE.SM,
    height: ICON_SIZE.SM,
    borderRadius: BORDER_RADIUS.FULL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.BOLD,
  },
});
