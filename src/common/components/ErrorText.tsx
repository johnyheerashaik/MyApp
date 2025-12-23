import React, {memo} from 'react';
import {Text} from 'react-native';

type Props = { text?: string | null; style?: any };

function ErrorTextBase({text, style}: Props) {
  if (!text) return null;
  return <Text style={style}>{text}</Text>;
}

export default memo(ErrorTextBase);
