import {StyleSheet} from 'react-native';
import {SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE} from '../constants';

export default StyleSheet.create({
  screen: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.BASE,
    paddingBottom: SPACING.SM,
    paddingTop: SPACING.XS,
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
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
  },

  topRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.BASE,
    paddingTop: SPACING.BASE,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: BORDER_RADIUS.LG,
    marginRight: SPACING.BASE,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: FONT_SIZE.XXXL,
    fontWeight: FONT_WEIGHT.EXTRA_BOLD,
    marginBottom: SPACING.XS,
  },
  meta: {
    fontSize: FONT_SIZE.SM,
    marginBottom: SPACING.SM,
  },
  genres: {
    fontSize: FONT_SIZE.XS,
    marginBottom: SPACING.BASE,
  },

  section: {
    paddingHorizontal: SPACING.BASE,
    marginTop: SPACING.BASE,
    marginBottom: SPACING.XS,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    marginBottom: SPACING.SM,
  },
  overview: {
    fontSize: FONT_SIZE.BASE,
    lineHeight: FONT_SIZE.XXL,
  },

  castRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  castAvatar: {
    width: ICON_SIZE.XXL,
    height: ICON_SIZE.XXL,
    borderRadius: BORDER_RADIUS.FULL,
    marginRight: SPACING.MD,
  },
  castInfo: {
    flex: 1,
  },
  castName: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  castCharacter: {
    fontSize: FONT_SIZE.XS,
  },


  castCard: {
    width: 90,
    marginRight: SPACING.MD,
  },
  castImage: {
    width: 90,
    height: 120,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.XS,
  },
  castPlaceholder: {
    width: 90,
    height: 120,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.XS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  castPlaceholderText: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.BOLD,
  },
});
