import {StyleSheet} from 'react-native';
import {SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ICON_SIZE} from '../constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.BASE,
  },
  card: {
    borderRadius: BORDER_RADIUS.XXXL,
    padding: SPACING.XXXL,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: FONT_SIZE.XXXL,
    fontWeight: FONT_WEIGHT.BOLD,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    marginBottom: SPACING.BASE,
    fontSize: FONT_SIZE.BASE,
  },
  input: {
    height: ICON_SIZE.XXL,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  button: {
    height: ICON_SIZE.XXL,
    borderRadius: BORDER_RADIUS.LG,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  buttonText: {
    // Use theme.colors.white in component
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },
  error: {
    fontSize: FONT_SIZE.XS,
    marginBottom: SPACING.XS,
  },
  signUpRow: {
    marginTop: SPACING.XXL,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
