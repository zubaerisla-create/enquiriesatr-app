import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 11/12/13/14/15 standard width (approx 390-393)
const widthBaseScale = SCREEN_WIDTH / 393;
const heightBaseScale = SCREEN_HEIGHT / 852;

function normalize(size: number, based = 'width') {
  const newSize = based === 'height' ? size * heightBaseScale : size * widthBaseScale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}

// Width Percentage
export const wp = (percentage: number) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Height Percentage
export const hp = (percentage: number) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive Font Size
export const rf = (size: number) => {
  return normalize(size);
};

// Responsive Spacing/Sizing
export const rs = (size: number) => {
  return normalize(size);
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
