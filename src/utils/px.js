import {
  Dimensions,
  Platform,
  PixelRatio
} from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

exports.px = function px(size) {
  if (PixelRatio.get() >= 3 && Platform.os === 'ios' && size === 1) {
    return size;
  }
  return deviceWidth / 750 * size;
}

exports.device = {
  width: deviceWidth,
  height: deviceHeight
}

exports.isIphoneX = (Platform.OS === 'ios' && (Number(((deviceHeight/deviceWidth)+"").substr(0,4)) * 100) === 216)