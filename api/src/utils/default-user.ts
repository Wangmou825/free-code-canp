// TODO: audit this object to find out which properties need to be updated.
import { type Prisma } from '@prisma/client';

export const defaultUser: Omit<Prisma.userCreateInput, 'email'> = {
  about: '',
  acceptedPrivacyTerms: false,
  completedChallenges: [],
  currentChallengeId: '',
  emailVerified: true,
  externalId: '',
  is2018DataVisCert: false,
  is2018FullStackCert: false,
  isApisMicroservicesCert: false,
  isBackEndCert: false,
  isBanned: false,
  isCheater: false,
  isDataAnalysisPyCertV7: false,
  isDataVisCert: false,
  isDonating: false,
  isFrontEndCert: false,
  isFrontEndLibsCert: false,
  isFullStackCert: false,
  isHonest: false,
  isInfosecCertV7: false,
  isInfosecQaCert: false,
  isJsAlgoDataStructCert: false,
  isMachineLearningPyCertV7: false,
  isQaCertV7: false,
  isRelationalDatabaseCertV8: false,
  isRespWebDesignCert: false,
  isSciCompPyCertV7: false,
  keyboardShortcuts: false,
  location: '',
  name: '',
  unsubscribeId: '',
  picture: '',
  profileUI: {
    isLocked: false,
    showAbout: false,
    showCerts: false,
    showDonation: false,
    showHeatMap: false,
    showLocation: false,
    showName: false,
    showPoints: false,
    showPortfolio: false,
    showTimeLine: false
  },
  progressTimestamps: [],
  sendQuincyEmail: false,
  theme: 'default',
  // TODO: generate a UUID like in api-server
  username: ''
};
