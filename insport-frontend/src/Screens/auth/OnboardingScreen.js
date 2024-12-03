import { Text, View } from 'react-native';
import React, { Component } from 'react';
import { OtpScreen } from '../../components/onboarding/OtpScreen';
import { InformationScreen } from '../../components/onboarding/InformationScreen';
import { CreatePasswordScreen } from '../../components/onboarding/CreatePasswordScreen';
import { CreateAccountScreen } from '../../components/onboarding/CreateAccountScreen';

export class OnboardingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
    };
  }

  // Function to navigate to the next step
  nextStep = () => {
    this.setState((prevState) => ({
      currentStep: prevState.currentStep + 1,
    }));
  };

  // Function to navigate to the previous step
  prevStep = () => {
    this.setState((prevState) => ({
      currentStep: prevState.currentStep - 1,
    }));
  };

  render() {
    const { currentStep } = this.state;
    const { navigation } = this.props; // Make sure navigation prop is available

    return (
      <View style={{ flex: 1, padding: 20 }}>
        {currentStep === 0 && (
          <CreateAccountScreen 
            navigation={navigation} // Pass the navigation prop
            onNext={this.nextStep} 
          />
        )}
        {currentStep === 1 && (
          <OtpScreen 
            onNext={this.nextStep} 
            onPrev={this.prevStep} 
          />
        )}
        {currentStep === 2 && (
          <InformationScreen 
            onNext={this.nextStep} 
            onPrev={this.prevStep} 
          />
        )}
        {currentStep === 3 && (
          <CreatePasswordScreen 
            onPrev={this.prevStep} 
          />
        )}
      </View>
    );
  }
}
