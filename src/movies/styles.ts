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
    fontSize: FONT_SIZE.XXXL,
    fontWeight: FONT_WEIGHT.EXTRA_BOLD,
  },

  searchWrapper: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
    marginTop: SPACING.XS,
    borderRadius: BORDER_RADIUS.XL,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.MD,
  },

  section: {
    marginTop: SPACING.BASE,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.XXXL,
    fontWeight: FONT_WEIGHT.EXTRA_BOLD,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  rowContent: {
    paddingHorizontal: SPACING.LG,
  },

  posterWrapper: {
    width: 180,
    marginRight: SPACING.BASE,
  },
  posterTouchable: {
    borderRadius: BORDER_RADIUS.XXXXL,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  favoriteBadge: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    width: ICON_SIZE.MD,
    height: ICON_SIZE.MD,
    borderRadius: BORDER_RADIUS.FULL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  movieTitle: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
    marginTop: SPACING.SM,
    marginBottom: SPACING.XS / 2,
  },
  movieMeta: {
    fontSize: FONT_SIZE.XS,
  },
});
