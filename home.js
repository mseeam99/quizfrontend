import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  TextInput,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { themes } from './themes';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { themeName, setThemeName, currentTheme } = props;

    async function handleLogout() {
        props.navigation.closeDrawer();

        props.navigation.reset({
            index: 0,
            routes: [{ name: 'LoginPage' }],
        });
    }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: currentTheme.background,
        paddingTop: 50,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
      }}
    >
      <View>
        <View
          style={[
            styles.drawerDivider,
            { backgroundColor: currentTheme.cardBorder },
          ]}
        />

        <View style={styles.drawerSection}>
          <Text style={[styles.drawerTitle, { color: currentTheme.text }]}>
            Theme
          </Text>

          <View style={styles.themeOptionsWrapper}>
            {[
              { key: 'dark', label: 'Dark Mode' },
              { key: 'light', label: 'Bright Mode' },
              { key: 'pink', label: 'Pink Theme' },
              { key: 'blue', label: 'Blue Theme' },
            ].map((item) => (
              <Pressable
                key={item.key}
                style={[
                  styles.themeOptionButton,
                  {
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.cardBorder,
                  },
                  themeName === item.key && {
                    backgroundColor: currentTheme.activeButton,
                    borderColor: currentTheme.activeBorder,
                  },
                ]}
                onPress={() => setThemeName(item.key)}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: currentTheme.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <Pressable
          style={[
            styles.logoutButton,
            {
              backgroundColor: currentTheme.wrong,
              borderColor: currentTheme.wrongBorder,
            },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: currentTheme.text }]}>
            Logout
          </Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

function QuizHomeScreen({ theme }) {
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionDropdownOpen, setQuestionDropdownOpen] = useState(false);

  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuestions, setSubmittedQuestions] = useState({});

  async function generateQuiz() {
    if (topic.trim() === '') {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      setQuizData([]);
      setSelectedAnswers({});
      setSubmittedQuestions({});
      setQuestionDropdownOpen(false);

      const response = await fetch('http://localhost:4000/generateQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          numberOfQuestions,
          difficulty,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert('Error', result.error || 'Failed to generate quiz');
        return;
      }

      if (
        !result.quiz ||
        !result.quiz.questions ||
        !Array.isArray(result.quiz.questions)
      ) {
        Alert.alert('Error', 'Quiz format is invalid');
        return;
      }

      setQuizData(result.quiz.questions);
    } catch (error) {
      console.log('Generate quiz error:', error);
      Alert.alert('Error', 'Could not connect to backend');
    } finally {
      setLoading(false);
    }
  }

  function chooseOption(questionIndex, option) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  }

  function submitSingleQuestion(questionIndex) {
    if (!selectedAnswers[questionIndex]) {
      Alert.alert('Select an answer', 'Please choose one option first');
      return;
    }

    setSubmittedQuestions((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  }

  function getOptionStyle(questionIndex, option, correctAnswer) {
    const isSubmitted = submittedQuestions[questionIndex];
    const selectedOption = selectedAnswers[questionIndex];

    if (!isSubmitted) {
      if (selectedOption === option) {
        return [
          styles.optionButton,
          {
            backgroundColor: theme.activeButton,
            borderColor: theme.activeBorder,
          },
        ];
      }

      return [
        styles.optionButton,
        {
          backgroundColor: theme.mutedButton,
          borderColor: theme.mutedBorder,
        },
      ];
    }

    if (option === correctAnswer) {
      return [
        styles.optionButton,
        {
          backgroundColor: theme.correct,
          borderColor: theme.correctBorder,
        },
      ];
    }

    if (selectedOption === option && option !== correctAnswer) {
      return [
        styles.optionButton,
        {
          backgroundColor: theme.wrong,
          borderColor: theme.wrongBorder,
        },
      ];
    }

    return [
      styles.optionButton,
      {
        backgroundColor: theme.mutedButton,
        borderColor: theme.mutedBorder,
        opacity: 0.7,
      },
    ];
  }

  function getOptionTextStyle(questionIndex, option) {
    const selectedOption = selectedAnswers[questionIndex];

    if (selectedOption === option) {
      return [styles.optionText, { color: '#ffffff' }];
    }

    return [styles.optionText, { color: theme.text }];
  }

  function calculateScore() {
    let score = 0;

    for (let i = 0; i < quizData.length; i++) {
      if (
        submittedQuestions[i] &&
        selectedAnswers[i] === quizData[i].correctAnswer
      ) {
        score += 1;
      }
    }

    return score;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.name === 'light' ? 'dark' : 'light'} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>Quiz App</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Enter a topic and generate a quiz
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Topic</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
            },
          ]}
          placeholder="Enter topic like Operating Systems"
          placeholderTextColor="#999"
          value={topic}
          onChangeText={setTopic}
        />

        <View style={styles.controlsRow}>
          <View style={[styles.controlBox, styles.leftControlBox]}>
            <Text style={[styles.label, { color: theme.text }]}>Questions</Text>

            <View style={styles.dropdownWrapper}>
              <Pressable
                style={[
                  styles.dropdownButton,
                  {
                    backgroundColor: theme.mutedButton,
                    borderColor: theme.mutedBorder,
                  },
                ]}
                onPress={() => setQuestionDropdownOpen((prev) => !prev)}
              >
                <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
                  {numberOfQuestions}
                </Text>
                <Text style={[styles.dropdownArrow, { color: theme.text }]}>
                  {questionDropdownOpen ? '▲' : '▼'}
                </Text>
              </Pressable>

              {questionDropdownOpen && (
                <View
                  style={[
                    styles.dropdownList,
                    {
                      backgroundColor: theme.mutedButton,
                      borderColor: theme.mutedBorder,
                    },
                  ]}
                >
                  {[5, 10, 15].map((item) => (
                    <Pressable
                      key={item}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: theme.mutedBorder },
                        numberOfQuestions === item && {
                          backgroundColor: theme.activeButton,
                        },
                      ]}
                      onPress={() => {
                        setNumberOfQuestions(item);
                        setQuestionDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[styles.dropdownItemText, { color: theme.text }]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.controlBox, styles.rightControlBox]}>
            <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
            <View style={styles.difficultyRow}>
              {['easy', 'medium', 'hard'].map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.diffButton,
                    {
                      backgroundColor: theme.mutedButton,
                      borderColor: theme.mutedBorder,
                    },
                    difficulty === item && {
                      backgroundColor: theme.activeButton,
                      borderColor: theme.activeBorder,
                    },
                  ]}
                  onPress={() => setDifficulty(item)}
                >
                  <Text style={[styles.diffText, { color: theme.text }]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.generateButton, { backgroundColor: theme.primary }]}
          onPress={generateQuiz}
        >
          <Text style={styles.generateButtonText}>Generate Quiz</Text>
        </Pressable>

        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={theme.text} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Generating quiz...
            </Text>
          </View>
        )}

        {quizData.length > 0 && (
          <View
            style={[
              styles.scoreCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.scoreTitle, { color: theme.subtext }]}>
              Score
            </Text>
            <Text style={[styles.scoreText, { color: theme.text }]}>
              {calculateScore()} / {quizData.length}
            </Text>
            <Text style={[styles.scoreSubText, { color: theme.subtext }]}>
              {topic} • {difficulty} • {numberOfQuestions} questions
            </Text>
          </View>
        )}

        {quizData.map((questionItem, questionIndex) => (
          <View
            key={questionIndex}
            style={[
              styles.questionCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.questionNumber, { color: theme.subtext }]}>
              Question {questionIndex + 1}
            </Text>

            <Text style={[styles.questionText, { color: theme.text }]}>
              {questionItem.question}
            </Text>

            {questionItem.options.map((option, optionIndex) => (
              <Pressable
                key={optionIndex}
                style={getOptionStyle(
                  questionIndex,
                  option,
                  questionItem.correctAnswer
                )}
                onPress={() => chooseOption(questionIndex, option)}
                disabled={submittedQuestions[questionIndex]}
              >
                <Text style={getOptionTextStyle(questionIndex, option)}>
                  {option}
                </Text>
              </Pressable>
            ))}

            {!submittedQuestions[questionIndex] ? (
              <Pressable
                style={[
                  styles.submitQuestionButton,
                  { backgroundColor: theme.secondary },
                ]}
                onPress={() => submitSingleQuestion(questionIndex)}
              >
                <Text style={styles.submitQuestionButtonText}>
                  Submit Answer
                </Text>
              </Pressable>
            ) : (
              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: theme.resultBackground },
                ]}
              >
                <Text style={[styles.resultText, { color: theme.text }]}>
                  {selectedAnswers[questionIndex] ===
                  questionItem.correctAnswer
                    ? 'Correct'
                    : `Wrong. Correct answer: ${questionItem.correctAnswer}`}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeDrawer() {
  const [themeName, setThemeName] = useState('dark');
  const currentTheme = useMemo(() => themes[themeName], [themeName]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          themeName={themeName}
          setThemeName={setThemeName}
          currentTheme={currentTheme}
        />
      )}
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.card,
        },
        headerTintColor: currentTheme.text,
        drawerStyle: {
          backgroundColor: currentTheme.background,
        },
        drawerActiveBackgroundColor: currentTheme.activeButton,
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: currentTheme.text,
      }}
    >
      <Drawer.Screen name="Home">
        {(props) => <QuizHomeScreen {...props} theme={currentTheme} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  controlBox: {
    flex: 1,
  },
  leftControlBox: {
    marginRight: 6,
    zIndex: 20,
  },
  rightControlBox: {
    marginLeft: 6,
    zIndex: 10,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownArrow: {
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownList: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diffButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  diffText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  generateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scoreCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  scoreSubText: {
    fontSize: 13,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  questionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitQuestionButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitQuestionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  resultBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  drawerSection: {
    paddingTop: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  drawerDivider: {
    height: 1,
    marginHorizontal: 4,
    marginBottom: 14,
  },
  themeOptionsWrapper: {
    paddingLeft: 18,
    paddingTop: 4,
  },
  themeOptionButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutSection: {
    paddingHorizontal: 8,
    paddingBottom: 30,
    paddingTop: 20,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});