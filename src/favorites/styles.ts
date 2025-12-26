
import {StyleSheet} from 'react-native';
import {SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT} from '../constants';

export default StyleSheet.create({
  favoritesSection: {
    marginTop: SPACING.MD,
    paddingHorizontal: SPACING.XL,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    gap: SPACING.SM,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  countBadge: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
    paddingRight: SPACING.XL,
  },
  sortButton: {
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.XXXL,
  },
  sortButtonText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  emptyText: {
    fontSize: FONT_SIZE.BASE,
  },
  favoriteItem: {
    width: 110,
    marginRight: SPACING.MD,
    position: 'relative',
  },
  favoritePoster: {
    width: 110,
    height: 160,
    borderRadius: BORDER_RADIUS.LG,
    marginBottom: SPACING.XS,
  },
  favoriteTitle: {
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.XS,
    right: SPACING.XS,
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.XL,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.BOLD,
    lineHeight: 16,
  },
  reminderBadge: {
    position: 'absolute',
    bottom: 30,
    left: SPACING.XS,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.XXL,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
    zIndex: 10,
  },
  reminderBadgeText: {
    fontSize: FONT_SIZE.BASE,
  },
});
