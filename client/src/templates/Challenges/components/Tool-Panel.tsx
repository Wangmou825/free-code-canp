import {
  Button,
  DropdownButton,
  MenuItem
} from '@freecodecamp/react-bootstrap';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './tool-panel.css';
import { openModal, executeChallenge } from '../redux';

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      executeChallenge,
      openHelpModal: () => openModal('help'),
      openVideoModal: () => openModal('video'),
      openResetModal: () => openModal('reset')
    },
    dispatch
  );

interface ToolPanelProps {
  executeChallenge: (options?: { showCompletionModal: boolean }) => void;
  isMobile: boolean;
  openHelpModal: () => void;
  openResetModal: () => void;
  openVideoModal: () => void;
  guideUrl: string;
  videoUrl: string;
}

function ToolPanel({
  executeChallenge,
  isMobile,
  openHelpModal,
  openVideoModal,
  openResetModal,
  guideUrl,
  videoUrl
}: ToolPanelProps) {
  const handleRunTests = () => {
    executeChallenge({ showCompletionModal: true });
  };
  const { t } = useTranslation();
  return (
    <div
      className={`tool-panel-group button-group ${
        isMobile ? 'tool-panel-group-mobile' : ''
      }`}
    >
      <Button
        aria-label='Run the tests use shortcut Ctrl+enter'
        block={true}
        bsStyle='primary'
        onClick={handleRunTests}
      >
        {isMobile ? t('buttons.run') : t('buttons.run-test')}
      </Button>
      <Button
        block={true}
        bsStyle='primary'
        className='btn-invert'
        onClick={openResetModal}
      >
        {isMobile ? t('buttons.reset') : t('buttons.reset-code')}
      </Button>
      <DropdownButton
        block={true}
        bsStyle='primary'
        className='btn-invert'
        id='get-help-dropdown'
        title={isMobile ? t('buttons.help') : t('buttons.get-help')}
      >
        {guideUrl ? (
          <MenuItem
            bsStyle='primary'
            className='btn-invert'
            href={guideUrl}
            target='_blank'
          >
            {t('buttons.get-hint')}
          </MenuItem>
        ) : null}
        {videoUrl ? (
          <MenuItem
            bsStyle='primary'
            className='btn-invert'
            onClick={openVideoModal}
          >
            {t('buttons.watch-video')}
          </MenuItem>
        ) : null}
        <MenuItem
          bsStyle='primary'
          className='btn-invert'
          onClick={openHelpModal}
        >
          {t('buttons.ask-for-help')}
        </MenuItem>
      </DropdownButton>
    </div>
  );
}

ToolPanel.displayName = 'ToolPanel';
export default connect(mapStateToProps, mapDispatchToProps)(ToolPanel);
