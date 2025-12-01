import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  screen: {
    flex: 1,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  }
});
