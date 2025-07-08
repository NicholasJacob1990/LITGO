// Platform-specific VideoConsultation loader
import { Platform } from 'react-native';

let VideoConsultation;

if (Platform.OS === 'web') {
  VideoConsultation = require('./VideoConsultation.web').default;
} else {
  VideoConsultation = require('./VideoConsultation').default;
}

export default VideoConsultation;