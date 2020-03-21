import AsyncStorage from '@react-native-community/async-storage';

async function getUserInfo() {
  const userInfo = await AsyncStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null;
}

async function getUserId() {
  const userInfo = await getUserInfo();
  return userInfo ? userInfo.id : ''
}

async function getToken() {
  const userInfo = await getUserInfo();
  return userInfo ? userInfo.token : ''
}


exports.getUserId = getUserId

exports.getUserInfo = getUserInfo

exports.getToken = getToken