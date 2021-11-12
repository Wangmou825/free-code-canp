import { Button } from '@freecodecamp/react-bootstrap';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

function BlockSaveButton({
  children,
  ...restProps
}: {
  children?: ReactNode;
  disabled?: boolean;
}): JSX.Element {
  const { t } = useTranslation();

  return (
    <Button
      block={true}
      bsSize='lg'
      bsStyle='primary'
      type='submit'
      {...restProps}
    >
      {children || t('buttons.save')}
    </Button>
  );
}

BlockSaveButton.displayName = 'BlockSaveButton';

export default BlockSaveButton;
