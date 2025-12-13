import {StyleSheet} from 'react-native';
import {SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT} from '../constants';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  searchContainer: {
    paddingHorizontal: SPACING.BASE,
    paddingBottom: SPACING.MD,
    gap: SPACING.SM,
  },
  locationButton: {
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  zipContainer: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  zipInput: {
    flex: 1,
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    fontSize: FONT_SIZE.BASE,
  },
  zipButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    justifyContent: 'center',
  },
  zipButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.BASE,
    fontSize: FONT_SIZE.BASE,
  },
  emptyText: {
    fontSize: FONT_SIZE.BASE,
  },
  list: {
    padding: SPACING.BASE,
  },
  theaterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.BASE,
    borderRadius: BORDER_RADIUS.LG,
    marginBottom: SPACING.MD,
  },
  theaterInfo: {
    flex: 1,
  },
  theaterName: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    marginBottom: SPACING.XS,
  },
  theaterAddress: {
    fontSize: FONT_SIZE.SM,
    marginBottom: SPACING.XS,
  },
  theaterDistance: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  directionsIcon: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
    marginLeft: SPACING.SM,
  },
});
