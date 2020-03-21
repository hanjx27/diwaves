import React from 'react';
import {
  Text,
  TouchableOpacity,
  Image,
  View,
  Dimensions
} from 'react-native';


import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');
import FocusBtn from './FocusBtn';
import { baseimgurl } from '../utils/Global';
import { withNavigation } from 'react-navigation';

class PersonSearch extends React.PureComponent {
  constructor(props) {
    super(props);
    
  }
  static defaultProps = {
  }
  
  
  componentDidMount() {
   
  }
  componentWillUnmount() {
    
  } 
  goPerson = () => {
    this.props.navigation.navigate('PersonScreen',{personid:this.props.person.id})
  }


  render() {

    return (
      <View style={{borderBottomWidth:0.4,borderBottomColor:'#f5f5f5',paddingHorizontal:15,flexDirection:'row',justifyContent:"space-between",alignItems:'center'}}>
        <TouchableOpacity onPress={this.goPerson} style={{display:'flex',flexDirection:'row',height:36,alignItems:"center",marginVertical:10}}>
          <Image style={{width:36,height:36,borderRadius:5}} source={{uri:(baseimgurl + this.props.person.avatar)}}></Image>
          <View style={{marginLeft:10}}>
            <Text style={{fontSize:15,fontWeight:"bold",color:Colors.TextColor,marginBottom:5}}>{this.props.person.name}</Text>
            <Text style={{fontSize:12,color:Colors.GreyColor}}>{this.props.person.fans + ' 粉丝'}</Text>
          </View>
        </TouchableOpacity>

        <View style={{height:28}}>
          <FocusBtn focuslist={this.props.focuslist} focususerid={this.props.person.id}></FocusBtn>
        </View>
      </View>
    )
  }
}

export default withNavigation(PersonSearch);
