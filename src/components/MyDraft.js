import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';

import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');
import { baseimgurl } from '../utils/Global';
import Datetime from '../components/Datetime';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { withNavigation } from 'react-navigation';

class MyDraft extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mydraft = this.props.mydraft; 
    this.state= {
      
    }
  }
  static defaultProps = {
    
  }
  
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  } 
 
  deleteDraft = () => {
    Alert.alert(
      '确认删除此草稿？',
      '',
      [
        {text: '确定', onPress: () => { this.props.deleteDraft(this.mydraft)}},
        {text: '取消', onPress: () => {}}
      ],
      { cancelable: true }
      )
   
  }

  goCreateAritlce = () => {
    this.props.navigation.navigate('CreateAritcle',{draft:this.mydraft});
  }

  render() {
    
    return (
      <View style={{flexDirection:'column',paddingHorizontal:15,paddingVertical:13,backgroundColor:'white',marginTop:5,borderBottomColor:'#eee',borderBottomWidth:0.4}}>
        <View style={{flex:1,flexDirection:'column'}}>
          <TouchableOpacity onPress={this.goCreateAritlce}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:16,fontWeight:'bold'}}>{this.mydraft.title?this.mydraft.title:'无标题'}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{marginTop:10,fontSize:14,color:Colors.sTextColor}}>{this.mydraft.contenttext?this.mydraft.contenttext:'无内容'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.deleteDraft} style={{width:60,marginTop:15,flexDirection:"row",alignItems:'center'}}>
            <AntDesign name='delete' size={18} color={Colors.sTextColor}/>
            <Text style={{marginLeft:5,fontSize:14,color:Colors.sTextColor}}>删除</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default withNavigation(MyDraft);
