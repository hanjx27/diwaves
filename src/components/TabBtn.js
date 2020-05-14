import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { withNavigation } from 'react-navigation';
import {px} from '../utils/px';
class TabBtn extends React.PureComponent {
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
   
    return (
        <TouchableOpacity onPress={this._onPress} style={[this.props.style,this.props.selected?{backgroundColor:'rgb(236, 246, 255)'}:{backgroundColor:'rgb(247,247,247)'},{paddingVertical:10,borderRadius:3,alignItems:'center',justifyContent:'center',marginRight:15}]}>
            <Text style={this.props.selected?{color:'#1584F5'}:{color:'#555555'}}>{this.props.title}</Text>
        </TouchableOpacity>
    )
  }
}

export default withNavigation(TabBtn);
