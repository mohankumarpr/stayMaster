import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator'; // Adjust the import path as necessary
import { StackNavigationProp } from '@react-navigation/stack';

export const navigationRef = createNavigationContainerRef<StackNavigationProp<RootStackParamList>>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    // navigationRef.navigate(name, params);
  }
}

export default {
  navigate,
};
