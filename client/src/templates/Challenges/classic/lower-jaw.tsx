import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@freecodecamp/react-bootstrap';

import Fail from '../../../assets/icons/fail';
import LightBulb from '../../../assets/icons/lightbulb';
import GreenPass from '../../../assets/icons/green-pass';
import { MAX_MOBILE_WIDTH } from '../../../../../config/misc';
import { apiLocation } from '../../../../../config/env.json';

interface LowerJawProps {
  hint?: string;
  challengeIsCompleted: boolean;
  openHelpModal: () => void;
  tryToExecuteChallenge: () => void;
  tryToSubmitChallenge: () => void;
  isEditorInFocus?: boolean;
  testsLength?: number;
  attempts: number;
  openResetModal: () => void;
  isSignedIn: boolean;
  updateContainer: () => void;
}

const LowerJaw = ({
  openHelpModal,
  challengeIsCompleted,
  hint,
  tryToExecuteChallenge,
  tryToSubmitChallenge,
  attempts,
  testsLength,
  isEditorInFocus,
  openResetModal,
  isSignedIn,
  updateContainer
}: LowerJawProps): JSX.Element => {
  const hintRef = React.useRef('');
  const [runningTests, setRunningTests] = useState(false);
  const [testFeedbackHeight, setTestFeedbackHeight] = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(attempts);
  const [isFeedbackHidden, setIsFeedbackHidden] = useState(false);
  const [testBtnAriaHidden, setTestBtnAriaHidden] = useState(false);
  const { t } = useTranslation();
  const submitButtonRef = React.createRef<HTMLButtonElement>();
  const testFeedbackRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    // Attempts should only be zero when the step is reset, so we should reset
    // the state here.
    if (attempts === 0) {
      setCurrentAttempts(0);
      setRunningTests(false);
      setTestBtnAriaHidden(false);
      setIsFeedbackHidden(false);
    }
    if (attempts > 0 && hint) {
      //hide the feedback from SR until the "Running tests" are displayed and removed.
      setIsFeedbackHidden(true);
      setRunningTests(true);
      //to prevent the changing attempts value from immediately triggering a new
      //render, the rendered component only depends on currentAttempts. Since
      //currentAttempts is updated with when the feedback is hidden, the screen
      //reader should only read out the new message.
      setCurrentAttempts(attempts);
      hintRef.current = hint;

      //display the test feedback contents.
      setTimeout(() => {
        setRunningTests(false);
        setIsFeedbackHidden(false);
      }, 300);
    }
  }, [attempts, hint]);

  useEffect(() => {
    if (challengeIsCompleted && submitButtonRef?.current) {
      submitButtonRef.current.focus();
      setTimeout(() => {
        setTestBtnAriaHidden(true);
      }, 500);
    }

    setTestBtnAriaHidden(challengeIsCompleted);
  }, [challengeIsCompleted, submitButtonRef]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (testFeedbackRef.current) {
      setTestFeedbackHeight(testFeedbackRef.current.clientHeight);
    }
    // Every render could change the shape of the jaw, so this effect will let
    // monaco know it might need to resize
    updateContainer();
  });

  const renderTestFeedbackContainer = () => {
    if (currentAttempts === 0) {
      return '';
    } else if (runningTests) {
      return <span className='sr-only'>{t('aria.running-tests')}</span>;
    } else if (challengeIsCompleted) {
      const submitKeyboardInstructions = isEditorInFocus ? (
        <span className='sr-only'>{t('aria.submit')}</span>
      ) : (
        ''
      );
      return (
        <div className='test-status fade-in' aria-hidden={isFeedbackHidden}>
          <div className='status-icon' aria-hidden='true'>
            <span>
              <GreenPass />
            </span>
          </div>
          <div className='test-status-description'>
            <h2>{t('learn.test')}</h2>
            <p className='status'>
              {t('learn.congratulations')}
              {submitKeyboardInstructions}
            </p>
          </div>
        </div>
      );
    } else if (hintRef.current) {
      const hintDescription = `<h2 class="hint">${t('learn.hint')}</h2> ${
        hintRef.current
      }`;
      return (
        <>
          <div
            data-cy='failing-test-feedback'
            className='test-status fade-in'
            aria-hidden={isFeedbackHidden}
          >
            <div className='status-icon' aria-hidden='true'>
              <span>
                <Fail />
              </span>
            </div>
            <div className='test-status-description'>
              <h2>{t('learn.test')}</h2>
              <p>{t(sentencePicker())}</p>
            </div>
          </div>
          <div className='hint-status fade-in' aria-hidden={isFeedbackHidden}>
            <div className='hint-icon' aria-hidden='true'>
              <span>
                <LightBulb />
              </span>
            </div>
            <div
              className='hint-description'
              dangerouslySetInnerHTML={{ __html: hintDescription }}
            />
          </div>
        </>
      );
    }
  };

  const sentencePicker = () => {
    const sentenceArray = [
      'learn.sorry-try-again',
      'learn.sorry-keep-trying',
      'learn.sorry-getting-there',
      'learn.sorry-hang-in-there',
      'learn.sorry-dont-giveup'
    ];
    return sentenceArray[currentAttempts % sentenceArray.length];
  };

  const renderContextualActionRow = () => {
    const isAttemptsLargerThanTest =
      currentAttempts &&
      testsLength &&
      (currentAttempts >= testsLength || currentAttempts >= 3);

    if (isAttemptsLargerThanTest && !challengeIsCompleted) {
      return (
        <div>
          <hr />
          <button
            className='btn-block btn fade-in'
            id='help-button'
            onClick={openHelpModal}
          >
            {t('buttons.ask-for-help')}
          </button>
          <button className='btn-block btn fade-in' onClick={openResetModal}>
            {t('learn.editor-tabs.restart-step')}
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <hr />
          <button className='btn-block btn fade-in' onClick={openResetModal}>
            {t('learn.editor-tabs.restart-step')}
          </button>
        </div>
      );
    }
  };

  const showDesktopButton = window.innerWidth > MAX_MOBILE_WIDTH;

  const renderButtons = () => {
    return (
      <>
        <div id='action-buttons-container'>
          {isSignedIn ? null : challengeIsCompleted ? (
            <Button
              block={true}
              href={`${apiLocation}/signin`}
              className='btn-cta'
            >
              {t('learn.sign-in-save')}
            </Button>
          ) : null}
          <button
            id='test-button'
            className={`btn-block btn ${challengeIsCompleted ? 'sr-only' : ''}`}
            aria-hidden={testBtnAriaHidden}
            onClick={tryToExecuteChallenge}
          >
            {showDesktopButton
              ? t('buttons.check-code')
              : t('buttons.check-code-2')}
          </button>
          <button
            id='submit-button'
            aria-hidden={!challengeIsCompleted}
            className='btn-block btn'
            onClick={tryToSubmitChallenge}
            ref={submitButtonRef}
          >
            {t('buttons.submit-and-go')}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className='action-row-container'>
      {renderButtons()}
      <div
        style={runningTests ? { height: `${testFeedbackHeight}px` } : {}}
        className={`test-feedback`}
        id='test-feedback'
        aria-live='assertive'
        ref={testFeedbackRef}
      >
        {renderTestFeedbackContainer()}
      </div>
      {renderContextualActionRow()}
    </div>
  );
};

LowerJaw.displayName = 'LowerJaw';

export default LowerJaw;
