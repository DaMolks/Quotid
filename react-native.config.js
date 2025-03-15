module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
        android: null, // disable Android platform, other platforms will still autolink
      },
    },
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts']
};
