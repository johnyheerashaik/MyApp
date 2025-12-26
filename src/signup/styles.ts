

import { StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS, ICON_SIZE, FONT_SIZE, FONT_WEIGHT } from '../constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.MD,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  card: {
    borderRadius: BORDER_RADIUS.LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.LG,
    padding: SPACING.LG,
  },
  title: {
    fontSize: FONT_SIZE.XXXXL,
    fontWeight: FONT_WEIGHT.BOLD,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.LG,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  input: {
    height: ICON_SIZE.XXL,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    fontSize: FONT_SIZE.LG,
    marginBottom: 2,
  },
  error: {
    fontSize: FONT_SIZE.SM,
    marginTop: SPACING.XS,
    marginLeft: SPACING.XS,
  },
  button: {
    height: ICON_SIZE.XXL,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  buttonText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  loginLinkText: {
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.LG,
    marginLeft: SPACING.SM,
  },
});

export default styles;
