import React, { Component } from 'react';
import {Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/Ionicons'

const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import { RNCamera } from 'react-native-camera'
export default class Scanner extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.key = this.props.navigation.getParam('key',null);
    this.state = {
     mounted:false
    }
  }  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    let that =this;
    setTimeout(function() {
      that.setState({
        mounted:true
      })
    },300)
   
  }

  
  componentWillUnmount() {
    
  }

  onBarCodeRead = (result) => {
    const {data} = result; //只要拿到data就可以了
    //扫码后的操作
    console.log(data)
    if(data.indexOf('IComment') >=0 ) {
      let items = data.split('=');
      if(items.length == 2) {
        this.props.navigation.navigate("PersonScreen",{personid:items[1],center:true});
      }
      
    }
    //alert(data)

  };

  
  render() {
    return (
      <View style={{width:width,height:height,flexDirection:'column',backgroundColor: 'black'}}>
      <StatusBar hidden={true} />
        
        {this.state.mounted &&
    
        <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    autoFocus={RNCamera.Constants.AutoFocus.on}/*自动对焦*/
                    style={{flex: 1,justifyContent:'space-between',alignItems:'center'}}
                    type={RNCamera.Constants.Type.back}/*切换前后摄像头 front前back后*/
                    flashMode={RNCamera.Constants.FlashMode.off}/*相机闪光模式*/
                    onBarCodeRead={this.onBarCodeRead}
        >
          
        <View style={{width:width,flexDirection:'row',alignItems:"center",justifyContent:'space-between',paddingHorizontal:15,paddingTop:20}}>
        <TouchableOpacity style={{minWidth: 44,height: 44,alignItems:'flex-start',justifyContent: 'center'}} onPress={() => {this.props.navigation.goBack()}}>
          <Icon
            name='ios-arrow-back'
            size={28}
            color={'white'}
          />
        </TouchableOpacity>
        
        </View>
        
        <View style={{width:width - 100,height:width - 100,justifyContent:'space-between'}}>
          <View style={{width:width - 100,flexDirection:"row",justifyContent:'space-between'}}>
            <View style={{width:20,height:20,backgroundColor:'rgba(0,0,0,0)',borderTopLeftRadius:6,borderLeftWidth:3,borderColor:"white",borderTopWidth:3}}></View>
            <View style={{width:20,height:20,backgroundColor:'rgba(0,0,0,0)',borderTopRightRadius:6,borderTopWidth:3,borderColor:"white",borderRightWidth:3}}></View>
          </View>
          <View style={{flexDirection:"row",justifyContent:'space-between'}}>
            <View style={{width:20,height:20,backgroundColor:'rgba(0,0,0,0)',borderBottomLeftRadius:6,borderLeftWidth:3,borderColor:"white",borderBottomWidth:3}}></View>
            <View style={{width:20,height:20,backgroundColor:'rgba(0,0,0,0)',borderBottomRightRadius:6,borderBottomWidth:3,borderColor:"white",borderRightWidth:3}}></View>
          </View>
        </View>

        <Text></Text>
        </RNCamera>
        }
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
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
  footerBox:{
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 34 : 0
  }
})
