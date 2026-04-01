export const features = {
  betaInviteRequired: process.env.FEATURE_BETA_INVITE === 'true',
  feedbackWidget: process.env.FEATURE_FEEDBACK !== 'false',
};

export const clientFeatures = {
  betaInviteRequired: process.env.NEXT_PUBLIC_FEATURE_BETA_INVITE === 'true',
  feedbackWidget: process.env.NEXT_PUBLIC_FEATURE_FEEDBACK !== 'false',
};
