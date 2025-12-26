import {StyleSheet} from 'react-native';
import {SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, DARK_THEME_COLORS} from '../constants';

export default StyleSheet.create({
  container: {
    marginHorizontal: SPACING.BASE,
    marginVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.BASE,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  justWatchButton: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  justWatchText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  section: {
    marginBottom: SPACING.MD,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    gap: SPACING.SM,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  badge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.SM,
  },
  badgeText: {
    color: DARK_THEME_COLORS.white,
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.BOLD,
    textTransform: 'uppercase',
  },
  providerList: {
    gap: SPACING.SM,
    paddingRight: SPACING.BASE,
  },
  providerCard: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  providerLogo: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.XS,
  },
  providerName: {
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.MEDIUM,
    textAlign: 'center',
  },
  noProviders: {
    fontSize: FONT_SIZE.SM,
    textAlign: 'center',
    paddingVertical: SPACING.MD,
  },
  disclaimer: {
    fontSize: FONT_SIZE.XS,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
});
