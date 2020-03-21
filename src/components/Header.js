import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  Image,
  Platform,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  NativeModules,
  View,
  Dimensions,
  Modal
} from 'react-native';

const { StatusBarManager } = NativeModules;
const {width,height} =  Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import { withNavigation } from 'react-navigation';

import Icon from 'react-native-vector-icons/Ionicons'
import { BoxShadow } from 'react-native-shadow';


const BackBtn = withNavigation((props) => {
  return (
    <TouchableOpacity onPress={() => {props.gobackfunction?props.gobackfunction() : props.navigation.goBack()}} style={[topStyles.btns, {flexDirection:'row',justifyContent:'flex-start', alignItems:'center'}]}>
      <Icon
        name='ios-arrow-back'
        size={24}
        color={props.color}
      />
      {props.isLeftTitle ? <Text style={[topStyles.title,  {color: props.color, paddingLeft: 20, fontSize: 16}] }>{props.title}</Text> : <Text />} 
      
    </TouchableOpacity>
  )
})

class Header extends React.Component {
  constructor(props) {
    super(props);
  
  }
  static defaultProps = {
    title : '',
    headerBackground: '#fff',
    color: '#000',
    withTopBox: true,
    translucent: true
  } 
  
  render() {
    const shadowOpt = {
      width:width,
      height:40,
      color:"#a1a1a1",
      border:4,
      radius:2,
      opacity:0.2,
      x:0,
      y:2
    }
    return (
      
      <View style={[topStyles.header, this.props.style, {backgroundColor: this.props.headerBackground}]}>
        <View style={[topStyles.bar, this.props.boxStyles]}>
          <View style={topStyles.leftBtn}>
            {this.props.leftBtn ? this.props.leftBtn : <BackBtn gobackfunction={this.props.gobackfunction} color={this.props.color} isLeftTitle={this.props.isLeftTitle} title={this.props.title}/>}
          </View>
            <View>
            {this.props.isLeftTitle ? <Text /> : <Text numberOfLines={1} style={[topStyles.title,  {color: this.props.color}]}>{this.props.title}</Text>}
            </View>

          <View style={topStyles.rightBtn}>
            {this.props.rightBtn}
          </View>
        </View>
        <View style={{backgroundColor: this.props.headerBackground, height: this.props.isHigh ? 126 : 0}}/>
      </View>
     
    )
  }
}

export default withNavigation(Header);


const styles = StyleSheet.create({
    shadow: {
      ...Platform.select({
        ios: {
          /* shadowColor: 'black',
          
          shadowOffset: { height: -3 },
          shadowOpacity: 0.7,
          shadowRadius: 3, */
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffset: {
            width: 0,
            height: 0.5
          },
          shadowRadius: 5,
          shadowOpacity: 1
        },
        android: {
          
        },
      })
    }
  });
const topStyles = StyleSheet.create({
  header: {
    width: px(750),
    borderBottomColor:'#eee',
    borderBottomWidth:0.5
  },
  topBox: {
    width: px(750),
    height: isIphoneX ? 44 : 20,
  },
  androidTop: {
    width: px(750),
    height: STATUSBAR_HEIGHT,
  },  
  bar: {
    width: px(750),
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#333',
    maxWidth: px(390)
  },
  leftBtn: {
    marginLeft: px(30),
    minWidth: px(150),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightBtn: {
    marginRight: px(30),
    width: px(150),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  btns: {
    minWidth: 44, 
    height: 44, 
    alignItems:'flex-start',
    justifyContent: 'center'
  }

})