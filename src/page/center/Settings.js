import React, { Component } from 'react';
import {Alert,DeviceEventEmitter,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

export default class Settings extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       user:null
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
  }

  componentWillUnmount() {
    
  }

  logout = async() => {
    Alert.alert('退出确认', '确认要退出当前账号吗？',
        [
            {
                text: "是", onPress: async() => {
                  AsyncStorage.removeItem('user');
                  this.setState({
                    user:null
                  })
                  DeviceEventEmitter.emit('logout', null);
                  this.props.navigation.goBack();
                }
            },
            {text: "否"}
        ])

    
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f5f5f5'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='设置' isLeftTitle={true} />

      {this.state.user != null &&
      <TouchableOpacity onPress={this.logout} style={styles.btn}>
        <Text style={{color:'black',fontSize:15}}>退出登录</Text>
      </TouchableOpacity>
      }

      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
      </View>
    );
  }
}

const topStyles = StyleSheet.create({
  androidTop: {
    width: px(750),
    height: STATUSBAR_HEIGHT,
  },  
  topBox: {
    backgroundColor:'#f5f5f5',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
  footerBox:{
    backgroundColor:'#f5f5f5',
    width: px(750),
    height: isIphoneX ? 34 : 0
  }
})

const styles = StyleSheet.create({
  btn:{
    backgroundColor:'white',
    alignItems:"center",
    justifyContent:"center",
    paddingVertical:15,
    marginTop:10
  }
})
