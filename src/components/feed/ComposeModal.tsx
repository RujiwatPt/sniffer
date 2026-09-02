import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';
import { TweetComposer } from './TweetComposer';

export const ComposeModal: React.FC = () => {
  const { isComposeModalOpen, setComposeModalOpen } = useSettingsStore();

  return (
    <Modal
      isOpen={isComposeModalOpen}
      onClose={() => setComposeModalOpen(false)}
      title="Create New Post"
      maxWidth="md"
    >
      <div className="-mx-4 -my-4">
        <TweetComposer
          isModal={true}
          onPostSuccess={() => setComposeModalOpen(false)}
        />
      </div>
    </Modal>
  );
};
