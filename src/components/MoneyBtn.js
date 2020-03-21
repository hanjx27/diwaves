import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { withNavigation } from 'react-navigation';
import {BoxShadow} from 'react-native-shadow'
const {width,height} =  Dimensions.get('window');
class MoneyBtn extends React.PureComponent {
  constructor(props) {
    super(props);
    
  }
  static defaultProps = {
  }
  
  
  componentDidMount() {
   
  }
  componentWillUnmount() {
    
  } 
  _onPress = () => {
    this.props.onPressed()
  }


  render() {
    const shadowOpt = {
      width:(width-70)/3-2,
      height:55-2,
      color:"#a1a1a1",
      border:4,
      radius:2,
      opacity:0.2,
      x:2,
      y:2,
      style:{marginTop:10}
    }

    return (
      <BoxShadow setting={shadowOpt}>
        <TouchableOpacity onPress={this._onPress} style={[this.props.selected?{backgroundColor:'#017bd1'}:{backgroundColor:'white'},{width:(width-70)/3,height:55,borderRadius:3,alignItems:'center',justifyContent:'center'}]}>
            <Text style={this.props.selected?{color:'white',fontWeight:'bold',fontSize:15}:{color:'black',fontWeight:'bold',fontSize:15}}>{this.props.title}</Text>
        </TouchableOpacity>
      </BoxShadow>
    )
  }
}

export default withNavigation(MoneyBtn);
