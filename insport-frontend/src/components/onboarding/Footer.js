import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const Footer = ({ icons }) => {

    console.log('Icons type:', typeof icons); // Should be 'object'
  console.log('Icons content:', icons); 


  if (!Array.isArray(icons)) {
    console.log("No icons is available");
  }     

  return (
    <View style={styles.footerContainer}>
    {icons.map((icon, index) => (
      <TouchableOpacity key={index} onPress={() => console.log(icon.name)}>
        <Image source={{ uri: icon.image }} style={styles.iconStyle} />
      </TouchableOpacity>
    ))}
  </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#CED9DC',
  },
  iconStyle: {
    width: 30,
    height: 30,
  },
});

export default Footer;
