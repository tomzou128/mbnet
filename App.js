import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import RecScreen from './src/screens/RecognitionScreen'

const navigator = createStackNavigator(
  {
    RecScreen: RecScreen
  },
  {
    initialRouteName: 'RecScreen',
    defaultNavigationOptions: {
      title: 'mobilenet test'
    }
  }
)

export default createAppContainer(navigator)