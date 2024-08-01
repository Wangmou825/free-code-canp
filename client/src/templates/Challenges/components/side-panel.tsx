import React, { useEffect, ReactElement } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { useTranslation } from 'react-i18next';
import { Button } from '@freecodecamp/ui';

import { Test } from '../../../redux/prop-types';
import { SuperBlocks } from '../../../../../shared/config/curriculum';
import { initializeMathJax } from '../../../utils/math-jax';
import { challengeTestsSelector } from '../redux/selectors';
import { openModal } from '../redux/actions';
import { Spacer } from '../../../components/helpers';
import TestSuite from './test-suite';
import ToolPanel from './tool-panel';

import './side-panel.css';

const mapStateToProps = createSelector(
  challengeTestsSelector,
  (tests: Test[]) => ({
    tests
  })
);

const mapDispatchToProps: {
  openModal: (modal: string) => void;
} = {
  openModal
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

interface SidePanelProps extends DispatchProps, StateProps {
  block: string;
  challengeDescription: ReactElement;
  challengeTitle: ReactElement;
  guideUrl: string;
  hasDemo: boolean | null;
  instructionsPanelRef: React.RefObject<HTMLDivElement>;
  showToolPanel: boolean;
  superBlock: SuperBlocks;
  tests: Test[];
  videoUrl: string;
}

export function SidePanel({
  block,
  challengeDescription,
  challengeTitle,
  guideUrl,
  instructionsPanelRef,
  showToolPanel = false,
  hasDemo,
  superBlock,
  tests,
  videoUrl,
  openModal
}: SidePanelProps): JSX.Element {
  const { t } = useTranslation();
  useEffect(() => {
    const mathJaxChallenge =
      superBlock === SuperBlocks.RosettaCode ||
      superBlock === SuperBlocks.ProjectEuler ||
      block === 'intermediate-algorithm-scripting';
    initializeMathJax(mathJaxChallenge);
  }, [block, superBlock]);

  return (
    <div
      className='instructions-panel'
      ref={instructionsPanelRef}
      tabIndex={-1}
    >
      {challengeTitle}
      {hasDemo && (
        <>
          <Button size='small' onClick={() => openModal('projectPreview')}>
            {t('buttons.show-demo')}
          </Button>
          <Spacer size='xSmall' />
        </>
      )}
      {challengeDescription}
      {showToolPanel && <ToolPanel guideUrl={guideUrl} videoUrl={videoUrl} />}
      <TestSuite tests={tests} />
    </div>
  );
}

SidePanel.displayName = 'SidePanel';

export default connect(mapStateToProps, mapDispatchToProps)(SidePanel);
