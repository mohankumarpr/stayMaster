import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';


type EarningsScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Earnings'>;
  };
  

const EarningsScreen: React.FC<EarningsScreenProps> = ({ navigation }) => {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [500, 1000, 750, 1250, 900, 1500],
                strokeWidth: 2,
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Earnings</Text>
            <LineChart
                data={data}
                width={Dimensions.get('window').width - 40} // from react-native
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />
        </View>
    );
};

const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    chart: { marginVertical: 8, borderRadius: 16 },
});

export default EarningsScreen;
