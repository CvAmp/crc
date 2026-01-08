import React from 'react';
import { Modal } from './Modal';
import { DeploymentStatus } from './DeploymentStatus';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeployed?: (url: string) => void;
  onClaimed?: () => void;
}

export function DeployModal({ isOpen, onClose, onDeployed, onClaimed }: DeployModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      title="Deploying Site"
      onClose={onClose}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <DeploymentStatus
          onDeployed={onDeployed}
          onClaimed={onClaimed}
        />
      </div>
    </Modal>
  );
}