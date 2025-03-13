import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {BarChart, LineChart} from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '../context/ThemeContext';
import {useDatabase} from '../context/DatabaseContext';
import {
  getStatsByCategory,
  getStatsOverTime,
  getStatsSummary,
} from '../services/statsService';
import {formatDate, getStartOfDay} from '../utils/dateUtils';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const {theme} = useTheme();
  const {database} = useDatabase();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  // Déterminer les dates de début et de fin en fonction de la plage de temps sélectionnée
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return {
      startDate: getStartOfDay(startDate),
      endDate,
    };
  };

  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      if (!database) return;

      setIsLoading(true);

      try {
        const {startDate, endDate} = getDateRange();

        // Charger les statistiques par catégorie
        const byCategory = await getStatsByCategory(database, startDate, endDate);
        setCategoryStats(byCategory);

        // Charger les statistiques dans le temps
        const overTime = await getStatsOverTime(database, startDate, endDate);
        setTimeStats(overTime);

        // Charger le résumé des statistiques
        const statsSummary = await getStatsSummary(database, startDate, endDate);
        setSummary(statsSummary);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [database, timeRange]);

  const formatChartData = () => {
    if (timeStats.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
        }],
      };
    }

    // Adapter le format des données en fonction de la plage de temps
    let labels: string[] = [];
    let data: number[] = [];

    switch (timeRange) {
      case 'week':
        // Afficher les 7 derniers jours
        labels = timeStats.slice(-7).map(stat => {
          const date = new Date(stat.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        data = timeStats.slice(-7).map(stat => stat.completionRate);
        break;
      case 'month':
        // Regrouper par semaine
        // Simplification : prendre un point tous les 7 jours
        labels = timeStats
          .filter((_, index) => index % 7 === 0)
          .map(stat => {
            const date = new Date(stat.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          });
        data = timeStats
          .filter((_, index) => index % 7 === 0)
          .map(stat => stat.completionRate);
        break;
      case 'year':
        // Regrouper par mois
        // Regrouper les données par mois (simplifié)
        const monthlyData: {[key: string]: number[]} = {};
        timeStats.forEach(stat => {
          const date = new Date(stat.date);
          const monthKey = `${date.getMonth()}-${date.getFullYear()}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          monthlyData[monthKey].push(stat.completionRate);
        });

        // Calculer la moyenne par mois
        labels = Object.keys(monthlyData).map(key => {
          const [month, year] = key.split('-');
          return `${parseInt(month) + 1}/${year.slice(2)}`;
        });
        data = Object.values(monthlyData).map(
          rates =>
            rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
        );
        break;
    }

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary,
    },
  };

  const categoryChartData = {
    labels: categoryStats.slice(0, 5).map(stat => stat.categoryName),
    datasets: [
      {
        data: categoryStats.slice(0, 5).map(stat => stat.completionRate),
      },
    ],
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Sélecteur de plage de temps */}
      <View
        style={[
          styles.timeRangeSelector,
          {backgroundColor: theme.card, borderBottomColor: theme.border},
        ]}>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'week' && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setTimeRange('week')}>
          <Text
            style={[
              styles.timeRangeText,
              {color: timeRange === 'week' ? theme.primary : theme.text},
            ]}>
            Semaine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'month' && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setTimeRange('month')}>
          <Text
            style={[
              styles.timeRangeText,
              {color: timeRange === 'month' ? theme.primary : theme.text},
            ]}>
            Mois
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'year' && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setTimeRange('year')}>
          <Text
            style={[
              styles.timeRangeText,
              {color: timeRange === 'year' ? theme.primary : theme.text},
            ]}>
            Année
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Résumé */}
          {summary && (
            <View
              style={[
                styles.summaryContainer,
                {backgroundColor: theme.card},
              ]}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.text},
                ]}>
                Résumé
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      {color: theme.primary},
                    ]}>
                    {summary.totalCompleted}
                  </Text>
                  <Text style={[styles.summaryLabel, {color: theme.text}]}>
                    Tâches complétées
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      {color: theme.primary},
                    ]}>
                    {summary.totalPlanned}
                  </Text>
                  <Text style={[styles.summaryLabel, {color: theme.text}]}>
                    Tâches planifiées
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      {color: theme.primary},
                    ]}>
                    {summary.globalCompletionRate}%
                  </Text>
                  <Text style={[styles.summaryLabel, {color: theme.text}]}>
                    Taux de complétion
                  </Text>
                </View>
              </View>

              {/* Meilleures et pires catégories */}
              <View style={styles.categoryHighlights}>
                {summary.bestCategory && (
                  <View
                    style={[
                      styles.categoryHighlight,
                      {backgroundColor: summary.bestCategory.categoryColor},
                    ]}>
                    <Text style={styles.categoryHighlightTitle}>
                      Catégorie la plus complétée
                    </Text>
                    <Text style={styles.categoryHighlightName}>
                      {summary.bestCategory.categoryName}
                    </Text>
                    <Text style={styles.categoryHighlightRate}>
                      {summary.bestCategory.completionRate}%
                    </Text>
                  </View>
                )}

                {summary.worstCategory && (
                  <View
                    style={[
                      styles.categoryHighlight,
                      {backgroundColor: summary.worstCategory.categoryColor},
                    ]}>
                    <Text style={styles.categoryHighlightTitle}>
                      Catégorie la moins complétée
                    </Text>
                    <Text style={styles.categoryHighlightName}>
                      {summary.worstCategory.categoryName}
                    </Text>
                    <Text style={styles.categoryHighlightRate}>
                      {summary.worstCategory.completionRate}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Graphique d'évolution */}
          <View style={styles.chartContainer}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>
              Évolution du taux de complétion
            </Text>
            {timeStats.length > 0 ? (
              <LineChart
                data={formatChartData()}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Icon
                  name="chart-line-variant"
                  size={48}
                  color={theme.border}
                />
                <Text style={[styles.noDataText, {color: theme.text}]}>
                  Pas assez de données pour cette période
                </Text>
              </View>
            )}
          </View>

          {/* Graphique par catégorie */}
          <View style={styles.chartContainer}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>
              Taux de complétion par catégorie
            </Text>
            {categoryStats.length > 0 ? (
              <BarChart
                data={categoryChartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="chart-bar" size={48} color={theme.border} />
                <Text style={[styles.noDataText, {color: theme.text}]}>
                  Pas assez de données pour cette période
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  timeRangeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeRangeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  categoryHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryHighlight: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  categoryHighlightTitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  categoryHighlightName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryHighlightRate: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default StatsScreen;
