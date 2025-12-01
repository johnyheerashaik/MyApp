import { StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, DARK_THEME_COLORS } from '../constants';

export default StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.XXXXL,
    padding: SPACING.BASE,
    borderWidth: 1,
    borderColor: DARK_THEME_COLORS.border,
    shadowColor: DARK_THEME_COLORS.black,
    shadowOpacity: 0.6,
    shadowRadius: SPACING.BASE,
    shadowOffset: {width: 0, height: SPACING.SM},
    elevation: 12,
  },

  headerText: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
    marginBottom: SPACING.MD,
  },

  chatContainer: {
    maxHeight: 350,
    marginBottom: SPACING.SM,
  },

  chatList: {
    paddingVertical: SPACING.SM,
  },

  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.BASE,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.XXXL,
    marginVertical: SPACING.XS,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: BORDER_RADIUS.SM,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: BORDER_RADIUS.SM,
  },

  messageText: {
    fontSize: FONT_SIZE.BASE,
    lineHeight: FONT_SIZE.XL,
  },

  inputRow: {
    flexDirection: 'row',
    marginTop: SPACING.MD,
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: 42,
    borderRadius: BORDER_RADIUS.XXXXL,
    paddingHorizontal: SPACING.BASE,
    fontSize: FONT_SIZE.BASE,
    borderWidth: 1,
    borderColor: DARK_THEME_COLORS.border,
  },

  askButton: {
    marginLeft: SPACING.MD,
    paddingHorizontal: SPACING.BASE,
    height: 42,
    borderRadius: BORDER_RADIUS.XXXXL,
    justifyContent: 'center',
    alignItems: 'center',
  },

  askButtonText: {
    color: DARK_THEME_COLORS.white,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },

  movieSuggestions: {
    marginTop: SPACING.XS,
    marginBottom: SPACING.SM,
    marginLeft: SPACING.XS,
  },

  movieSuggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.LG,
    marginBottom: SPACING.XS,
    borderWidth: 1,
  },

  movieSuggestionInfo: {
    flex: 1,
    marginRight: SPACING.SM,
  },

  movieSuggestionTitle: {
    fontSize: FONT_SIZE.BASE,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
    marginBottom: 2,
  },

  movieSuggestionYear: {
    fontSize: FONT_SIZE.SM,
  },

  addToFavButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.LG,
    minWidth: 70,
    alignItems: 'center',
  },

  addToFavText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },

  quickActionsContainer: {
    marginBottom: SPACING.MD,
  },

  quickActionsTitle: {
    fontSize: FONT_SIZE.SM,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.SM,
  },

  quickActionButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },

  quickActionEmoji: {
    fontSize: FONT_SIZE.LG,
  },

  quickActionText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
  },

  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
});
